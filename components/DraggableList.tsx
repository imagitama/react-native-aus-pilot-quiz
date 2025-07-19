import React, { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import DraggableFlatList, {
  RenderItemParams,
} from "react-native-draggable-flatlist";

let DragDropContext: any = null;
let Droppable: any = null;
let Draggable: any = null;

if (Platform.OS === "web") {
  const dnd = require("@hello-pangea/dnd");
  DragDropContext = dnd.DragDropContext;
  Droppable = dnd.Droppable;
  Draggable = dnd.Draggable;
}

export interface DraggableItem {
  id: string;
  label: string;
}

interface Props {
  leftItems: DraggableItem[];
  rightItems: DraggableItem[];
  onChange: (left: DraggableItem[], right: DraggableItem[]) => void;
  renderItem?: (
    item: DraggableItem,
    index: number,
    isInactive?: boolean
  ) => React.ReactNode;
}

export const DraggableList: React.FC<Props> = ({
  leftItems,
  rightItems,
  onChange,
  renderItem,
}) => {
  const defaultRenderItem = (
    item: DraggableItem,
    index: number,
    isInactive: boolean
  ) => (
    <View style={[styles.item, isInactive ? "" : styles.active]}>
      <Text style={[isInactive ? styles.inactiveText : styles.activeText]}>
        {isInactive ? "" : `${index + 1}.`} {item.label}
      </Text>
    </View>
  );

  /** ---------------- WEB VERSION ---------------- */
  if (Platform.OS === "web") {
    const onDragEnd = (result: any) => {
      const { source, destination } = result;
      if (!destination) return;

      const sourceList = source.droppableId === "left" ? leftItems : rightItems;
      const destList =
        destination.droppableId === "left" ? leftItems : rightItems;
      const setLists = (newLeft: DraggableItem[], newRight: DraggableItem[]) =>
        onChange(newLeft, newRight);

      // Moving within same list
      if (source.droppableId === destination.droppableId) {
        const updated = Array.from(sourceList);
        const [moved] = updated.splice(source.index, 1);
        updated.splice(destination.index, 0, moved);
        if (source.droppableId === "left") setLists(updated, rightItems);
        else setLists(leftItems, updated);
      } else {
        // Moving between lists
        const newSource = Array.from(sourceList);
        const newDest = Array.from(destList);
        const [moved] = newSource.splice(source.index, 1);
        newDest.splice(destination.index, 0, moved);
        if (source.droppableId === "left") setLists(newSource, newDest);
        else setLists(newDest, newSource);
      }
    };

    const renderDroppable = (id: "left" | "right", items: DraggableItem[]) => (
      <Droppable droppableId={id} direction="horizontal">
        {(provided: any) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={webContainerStyle}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided: any) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...webItemStyle,
                      ...provided.draggableProps.style,
                    }}
                  >
                    {renderItem
                      ? renderItem(item, index, id === "right")
                      : defaultRenderItem(item, index, id === "right")}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    );

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: "flex", gap: "20px", flexDirection: "column" }}>
          {renderDroppable("left", leftItems)}
          {renderDroppable("right", rightItems)}
        </div>
      </DragDropContext>
    );
  }

  /** ---------------- NATIVE VERSION ---------------- */
  const handleReorder = useCallback(
    (listName: "left" | "right", data: DraggableItem[]) => {
      if (listName === "left") onChange(data, rightItems);
      else onChange(leftItems, data);
    },
    [leftItems, rightItems, onChange]
  );

  const renderNativeList = (
    listName: "left" | "right",
    data: DraggableItem[]
  ) => (
    <DraggableFlatList
      horizontal
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={({
        getIndex,
        item,
        drag,
      }: RenderItemParams<DraggableItem>) => (
        <Pressable onLongPress={drag}>
          {renderItem
            ? renderItem(item, getIndex()!, listName === "right")
            : defaultRenderItem(item, getIndex()!, listName === "right")}
        </Pressable>
      )}
      onDragEnd={({ data }) => handleReorder(listName, data)}
      style={{ flex: 1 }}
    />
  );

  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      {renderNativeList("left", leftItems)}
      {renderNativeList("right", rightItems)}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    color: "#FFF",
    display: "flex",
    alignItems: "center",
  },
  active: {
    backgroundColor: "#fff",
    color: "#000",
  },
  inactiveText: {
    color: "#FFF",
  },
  activeText: {
    color: "#000",
  },
});

const webContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "row",
  gap: "10px",
  minHeight: "50px",
  minWidth: "150px",
  border: "1px dashed #999",
  padding: "5px",
};

const webItemStyle: React.CSSProperties = {
  //   padding: 5,
  //   border: "1px solid #ccc",
  //   borderRadius: 5,
};

export default DraggableList;
