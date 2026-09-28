import { useEffect, useState } from "react";
import { listCategories } from "../api.js";

const ADD_NEW = "__add_new__";

// A dropdown of every category already in use, plus an escape hatch to type
// a brand new one - categories aren't a fixed enum, they're just whatever
// distinct values courses/modules currently have (see server's
// listCourseCategories), so this is how the vocabulary grows.
export function CategorySelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (value: string) => void;
  id?: string;
}) {
  const [categories, setCategories] = useState<string[]>([]);
  // Once true, always show the free-text input rather than snapping back to
  // the dropdown - avoids losing an in-progress typed value if categories
  // happens to re-fetch mid-edit.
  const [addingNew, setAddingNew] = useState(false);

  useEffect(() => {
    listCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const knownValue = value === "" || categories.includes(value);

  if (addingNew || !knownValue) {
    return (
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Core, IT, Business"
        autoFocus={addingNew}
      />
    );
  }

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => {
        if (e.target.value === ADD_NEW) {
          setAddingNew(true);
          onChange("");
        } else {
          onChange(e.target.value);
        }
      }}
    >
      <option value="">(none)</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
      <option value={ADD_NEW}>+ Add new category...</option>
    </select>
  );
}
