import { h, Component } from 'preact'
import { hqSvg } from './hqIcon'

export interface IHqButtonProps {
  hq: boolean
  onHqChange: (value: boolean) => void
}

export class HqButton extends Component<IHqButtonProps> {
  public render() {
    const style: any = {
      cursor: 'pointer',
      userSelect: 'none',
    }

    if (!this.props.hq) {
      style.opacity = 0.2
    }

    return (
      <span style={style} onClick={this.handleHqClick} onMouseDown={this.preventSelectText}>
        {' '}
        {hqSvg}
      </span>
    )
  }

  private handleHqClick = () => {
    this.props.onHqChange(!this.props.hq)
  }

  private preventSelectText = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }
}
