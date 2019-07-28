import { h, Component } from 'preact'

export class CKComment extends Component {
  public render() {
    return <div class="ck-comment">{this.props.children}</div>
  }
}
