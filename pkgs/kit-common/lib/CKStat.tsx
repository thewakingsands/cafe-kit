export interface ICKStatProps {
  name: string
  value: any
  style?: any
}

export function CKStat(props: ICKStatProps) {
  return (
    <div class="ck-stat" style={props.style}>
      <div class="ck-stat-name">{props.name}</div>
      <div class="ck-stat-border" />
      <div class="ck-stat-value">{props.value}</div>
    </div>
  )
}
