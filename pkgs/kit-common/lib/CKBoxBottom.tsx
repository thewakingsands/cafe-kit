import { h, Component } from 'preact'

export class CKBoxBottom extends Component {
  public render() {
    return (
      <div class="ck-box-bottom-wrapper">
        <div class="ck-box-bottom">{this.props.children}</div>
      </div>
    )
  }
}
