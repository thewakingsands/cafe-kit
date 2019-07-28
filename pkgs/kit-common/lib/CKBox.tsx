import { h, Component } from 'preact'

export class CKBox extends Component {
  public render() {
    return <div class="ck-box">{this.props.children}</div>
  }
}
