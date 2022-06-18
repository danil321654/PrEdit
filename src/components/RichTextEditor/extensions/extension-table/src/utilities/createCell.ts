import {
  NodeType,
  Fragment,
  Node as ProsemirrorNode,
  Schema,
} from 'prosemirror-model'

export function createCell(
  cellType: NodeType,
  cellContent?:
    | Fragment<Schema>
    | ProsemirrorNode<Schema>
    | Array<ProsemirrorNode<Schema>>,
  attrs?: Record<string, any>,
): ProsemirrorNode | null | undefined {
  if (cellContent) {
    return cellType.createChecked(null, cellContent)
  }
  return cellType.createAndFill(attrs)
}
