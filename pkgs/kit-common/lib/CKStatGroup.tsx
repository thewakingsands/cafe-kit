import { h, Component } from 'preact'

export class CKStatGroup extends Component {
  public render() {
    return <div class="ck-stat-group">{this.props.children}</div>
  }
}
