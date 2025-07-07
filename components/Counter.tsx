import Button from "./Button";
import styles from "./Counter.module.css";

export default function Counter({
  count,
  min,
  setCount,
}: {
  count: number;
  min: number;
  setCount: (count: number) => void;
}) {
  const onAdd = () => setCount(count + 1);
  const onSubtract = () => setCount(count - 1);
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setCount(isNaN(newValue) ? 0 : newValue);
  };

  return (
    <div className={styles.counter}>
      <Button
        img="/img/subtract.svg"
        text="Subtract"
        textVisible="hidden"
        onClick={onSubtract}
        disabled={count === min}
      />
      <input type="number" value={count} onChange={onChange} />
      <Button
        img="/img/add.svg"
        text="Add"
        textVisible="hidden"
        onClick={onAdd}
      />
    </div>
  );
}
