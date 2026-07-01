// Saver — Categories list (showcase 41-style): expense / income, tap to edit, + to add.
import { DndContext, closestCenter, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Ico from "../ui/Ico.jsx";
import CatTile from "../ui/CatTile.jsx";
import { resolveCat } from "../ui/cats.js";
import { useT } from "../lib/i18n.js";

const catKeyOf = (c) => resolveCat({ catId: c.id, catGlyph: c.glyph, catName: c.name }) || null;

// Rows are dragged directly (no separate grip handle). MouseSensor needs a small
// move before it claims the pointer (so a tap still opens the category); TouchSensor
// needs a short hold before it claims the pointer (so a normal scroll swipe is never
// hijacked into a drag).
const useRowDndSensors = () => useSensors(
  useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
  useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
);

function SortableCatRow({ c, kind, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const style = {
    cursor: "pointer", transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? .85 : 1, zIndex: isDragging ? 2 : "auto", position: "relative",
    ...(isDragging ? { boxShadow: "0 14px 30px rgba(0,0,0,.22)" } : {}),
  };
  return (
    <div className="icard" ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={() => onEdit?.({ ...c, _kind: kind })}>
      <CatTile cat={catKeyOf(c)} name={c.name} color={c.color} size={42} />
      <div><div className="nm">{c.name}</div></div>
      <span className="amtb"><Ico name="chev" size={18} color="var(--faint)" /></span>
    </div>
  );
}

export default function Categories({ store, back, onEdit, onAdd }) {
  const { expCats = [], incCats = [] } = store;
  const tr = useT();
  const dndSensors = useRowDndSensors();
  const onDragEnd = (key) => ({ active, over }) => {
    if (!over || active.id === over.id) return;
    store.set(key, (list) => {
      const oldIndex = list.findIndex((x) => x.id === active.id);
      const newIndex = list.findIndex((x) => x.id === over.id);
      return oldIndex < 0 || newIndex < 0 ? list : arrayMove(list, oldIndex, newIndex);
    });
  };
  const section = (title, list, kind, key) => (
    <>
      <div className="over" style={{ marginTop: 18 }}>{title}</div>
      <DndContext sensors={dndSensors} collisionDetection={closestCenter} onDragEnd={onDragEnd(key)}>
        <SortableContext items={list.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.map((c) => <SortableCatRow key={c.id} c={c} kind={kind} onEdit={onEdit} />)}
        </SortableContext>
      </DndContext>
    </>
  );

  return (
    <div className="content padnav">
      <div className="hero">
        <div className="toprow"><div className="hib" onClick={back}><Ico name="back" size={20} /></div><div className="ttl">{tr("profile.categories")}</div><div className="grow" /><div className="hib" onClick={onAdd}><Ico name="plus" size={20} /></div></div>
        <div className="lbl">{tr("cats.organise")}</div>
        <div className="big" style={{ fontSize: 30 }}>{tr("cats.count", { n: expCats.length + incCats.length })}</div>
        <div className="sub">{tr("cats.breakdown", { e: expCats.length, i: incCats.length })}</div>
      </div>
      {section(tr("edit.type_expense"), expCats, "expense", "expCats")}
      {section(tr("edit.type_income"), incCats, "income", "incCats")}
    </div>
  );
}
