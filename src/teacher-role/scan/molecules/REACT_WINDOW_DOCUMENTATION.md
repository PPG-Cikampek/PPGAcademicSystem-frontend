# react-window documentation

## The simplest type of list to render is one with fixed row heights.

To render this type of list, you need to specify how many rows it contains (rowCount), which component should render rows (rowComponent), and the height of each row (rowHeight):

```
import { List } from "react-window";
function Example({ names }) {
return (
<List
rowComponent={RowComponent}
rowCount={names.length}
rowHeight={25}
rowProps={{ names }}
/>
);
}
```

The rowProps object can also be used to share between components. Values passed in rowProps will also be passed as props to the row component:

```
import {} from "react-window";
function RowComponent({ index, names, style }) {
return (
<div className="flex items-center justify-between" style={style}>
{names[index]}
<div className="text-slate-500 text-xs">{`${index + 1} of ${names.length}`}</div>
</div>
);
}
```

> WARNING: Lists require vertical space to render rows. Typically the ResizeObserver API is used to determine how much space there is available within the parent DOM element.
> If an explicit height is specified (in pixels) using the style prop, ResizeObserver will not be used.

## Lists with rows of different types may require different heights to render.

This list requires a rowHeight function that tells it what height a row should be based on the type of data it contains.

```
import { List } from "react-window";
function Example({ items }) {
    return (
        <List
            rowComponent={RowComponent}
            rowCount={items.length}
            rowHeight={rowHeight}
            rowProps={{ items }}
        />
    );
}
function rowHeight(index, { items }) {
    switch (items[index].type) {
        case "state": {
            return 30;
        }
        case "zip": {
            return 25;
        }
    }
}
function RowComponent({ index, items, style }) {
    const item = items[index];
    const className = getClassName(item);
    return (
        <div className={className} style={style}>
            {item.type === "state" ? (
                <span>{item.state}</span>
            ) : (
                <span>
                    {item.city}, {item.zip}
                </span>
            )}
            <div className="text-slate-500 text-xs">{`${index + 1} of ${
                items.length
            }`}</div>
        </div>
    );
}

```

## Component Props

### Required props

`rowComponent`:

> (props: { index: number; style: CSSProperties; } & RowProps) => ReactNode

React component responsible for rendering a row.
This component will receive an index and style prop by default. Additionally it will receive prop values passed to rowProps.

⚠️ The prop types for this component are exported as RowComponentProps

`rowCount`:

> number

Number of items to be rendered in the list.

`rowHeight`:

> string | number | ((index: number, cellProps: RowProps) => number)

Row height; the following formats are supported:

-   number of pixels (number)
-   percentage of the grid's current height (string)
-   function that returns the row height (in pixels) given an index and cellProps

`rowProps`:

> ExcludeForbiddenKeys<RowProps>

Additional props to be passed to the row-rendering component. List will automatically re-render rows when values in this object change.

⚠️ This object must not contain either an index or style prop.

### Optional props

`className`?:

> string | undefined

CSS class name.

`defaultHeight`?:

> number | undefined = 0

Default height of list for initial render. This value is important for server rendering.

`listRef`?:

> Ref<ListImperativeAPI> | undefined

Ref used to interact with this component's imperative API.

This API has imperative methods for scrolling and a getter for the outermost DOM element.

⚠️ The useListRef and useListCallbackRef hooks are exported for convenience use in TypeScript projects.

`onResize`?:

> ((size: { height: number; width: number; }, prevSize: { height: number; width: number; }) => void) | undefined

Callback notified when the List's outermost HTMLElement resizes. This may be used to (re)scroll a row into view.

`onRowsRendered`?:

> ((args: { startIndex: number; stopIndex: number; }) => void) | undefined

Callback notified when the range of visible rows changes.

`overscanCount`?:

> number | undefined = 3

How many additional rows to render outside of the visible area. This can reduce visual flickering near the edges of a list when scrolling.

`style`?:

> CSSProperties | undefined

Optional CSS properties. The list of rows will fill the height defined by this style.

## Imperative API

List provides an imperative API for responding to events. The recommended way to access this API is to use the exported ref hook:

`import { useListRef } from "react-window";`

Attach the ref during render:

```
function Example(props) {
    const listRef = useListRef(null);
    return <List listRef={listRef} {...props} />;
}
```

And call API methods in an event handler:

```
const onClick = () => {
    const list = listRef.current;
    list?.scrollToRow({
        align: "auto", // optional
        behavior: "auto", // optional
        index: 250,
    });
};

```

Note If you are passing the ref to another component or hook, use the ref callback function instead.

```
import { useListCallbackRef } from "react-window";
function Example(props) {
const [list, setList] = useListCallbackRef(null);
useCustomHook(list);
return <List listRef={setList} {...props} />;
}
```
