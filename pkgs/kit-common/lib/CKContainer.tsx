import { h, Component } from 'preact'

export class CKContainer extends Component<{ style?: any; className?: any }> {
  public render() {
    return (
      <div class={`ck-container ${this.props.className || ''}`} style={this.props.style}>
        {this.props.children}
      </div>
    )
  }
}
