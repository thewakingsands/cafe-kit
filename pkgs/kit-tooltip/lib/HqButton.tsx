import { hqSvg } from './hqIcon'

export interface IHqButtonProps {
  hq: boolean
  onHqChange: (value: boolean) => void
}

export function HqButton(props: IHqButtonProps) {
  const style: any = {
    cursor: 'pointer',
    userSelect: 'none',
  }

  if (!props.hq) {
    style.opacity = 0.2
  }

  const handleHqClick = () => {
    props.onHqChange(!props.hq)
  }

  const preventSelectText = (e: MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <span style={style} onClick={handleHqClick} onMouseDown={preventSelectText}>
      {' '}
      {hqSvg}
    </span>
  )
}
