import { FixedSizeList as List } from "react-window";

const height = 40; // Height of each option

export const MenuList = (props) => {
  const { options, children, maxHeight, getValue } = props;
  const [value] = getValue();
  const initialOffset = options.indexOf(value) * height;

  return (
    <List
      height={Math.min(maxHeight, options.length * height)}
      itemCount={children.length}
      itemSize={height}
      initialScrollOffset={initialOffset}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          {children[index]}
        </div>
      )}
    </List>
  );
};
