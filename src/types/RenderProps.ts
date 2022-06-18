export interface RenderProp<TChildrenProps> {
  (props: TChildrenProps): JSX.Element
}
