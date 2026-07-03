// Saver — thin wrapper around Apple's own Speech framework, used instead of
// @capacitor-community/speech-recognition: that plugin only ships a CocoaPods
// podspec (no Package.swift), and this project's iOS build uses pure SPM, so
// it silently failed to register. This one lives directly in the App target.
import Capacitor
import Speech
import AVFoundation

@objc(SpeechBridgePlugin)
public class SpeechBridgePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "SpeechBridgePlugin"
    public let jsName = "SpeechBridge"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "requestPermissions", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise),
    ]

    private var recognizer: SFSpeechRecognizer?
    private var request: SFSpeechAudioBufferRecognitionRequest?
    private var task: SFSpeechRecognitionTask?
    private let audioEngine = AVAudioEngine()

    @objc override public func requestPermissions(_ call: CAPPluginCall) {
        SFSpeechRecognizer.requestAuthorization { speechStatus in
            AVAudioSession.sharedInstance().requestRecordPermission { micGranted in
                DispatchQueue.main.async {
                    call.resolve(["granted": speechStatus == .authorized && micGranted])
                }
            }
        }
    }

    @objc func start(_ call: CAPPluginCall) {
        let language = call.getString("language") ?? "en-US"
        stopInternal()

        recognizer = SFSpeechRecognizer(locale: Locale(identifier: language))
        guard let recognizer = recognizer, recognizer.isAvailable else {
            call.reject("recognizer-unavailable")
            return
        }

        let session = AVAudioSession.sharedInstance()
        do {
            try session.setCategory(.record, mode: .measurement, options: .duckOthers)
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            call.reject("audio-session-error")
            return
        }

        let request = SFSpeechAudioBufferRecognitionRequest()
        request.shouldReportPartialResults = true
        self.request = request

        task = recognizer.recognitionTask(with: request) { [weak self] result, error in
            guard let self = self else { return }
            if let result = result {
                self.notifyListeners("partialResults", data: ["matches": [result.bestTranscription.formattedString]])
                if result.isFinal {
                    call.resolve(["matches": [result.bestTranscription.formattedString]])
                    self.stopInternal()
                }
            }
            if let error = error {
                let nsError = error as NSError
                // Code 216/1110 fire on a clean manual stop with no final result yet — not a real error.
                if nsError.domain == "kAFAssistantErrorDomain" && (nsError.code == 216 || nsError.code == 1110) {
                    call.resolve(["matches": [String]()])
                } else {
                    call.reject(error.localizedDescription)
                }
                self.stopInternal()
            }
        }

        let inputNode = audioEngine.inputNode
        let format = inputNode.outputFormat(forBus: 0)
        inputNode.removeTap(onBus: 0)
        inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
            request.append(buffer)
        }

        audioEngine.prepare()
        do {
            try audioEngine.start()
        } catch {
            call.reject("engine-start-error")
        }
    }

    // Stops capturing but leaves the recognition task running so it can
    // deliver a final transcript for whatever was already said — the pending
    // `start` promise resolves separately once that arrives (see closure above).
    @objc func stop(_ call: CAPPluginCall) {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        request?.endAudio()
        call.resolve()
    }

    private func stopInternal() {
        if audioEngine.isRunning {
            audioEngine.stop()
            audioEngine.inputNode.removeTap(onBus: 0)
        }
        request?.endAudio()
        task?.cancel()
        task = nil
        request = nil
        try? AVAudioSession.sharedInstance().setActive(false, options: .notifyOthersOnDeactivation)
    }
}
