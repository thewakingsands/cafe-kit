import { h, Component } from 'preact'
import { CKAction } from './CKAction'

export class CKActionIcon extends Component<{ src: string; size: number | string }> {
  public render() {
    return (
      <CKAction style={{ width: this.props.size, height: this.props.size }}>
        <img src={this.props.src} />
      </CKAction>
    )
  }
}
