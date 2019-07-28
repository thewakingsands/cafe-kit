import { h, Component } from 'preact'

export interface ICKStatProps {
  name: string
  value: any
  style?: any
}

export class CKStat extends Component<ICKStatProps> {
  public render() {
    return (
      <div class="ck-stat" style={this.props.style}>
        <div class="ck-stat-name">{this.props.name}</div>
        <div class="ck-stat-border" />
        <div class="ck-stat-value">{this.props.value}</div>
      </div>
    )
  }
}
