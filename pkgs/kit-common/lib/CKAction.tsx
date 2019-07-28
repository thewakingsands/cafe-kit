import { h, Component } from 'preact'

export class CKAction extends Component<{ style?: any; className?: any }> {
  public render() {
    return (
      <div class={`ck-action ${this.props.className || ''}`} style={this.props.style}>
        <div class="ck-action-cover" />
        {this.props.children}
      </div>
    )
  }
}
