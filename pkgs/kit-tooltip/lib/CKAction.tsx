import { h, Component } from 'preact'
import {
  CKBox,
  CKContainer,
  CKItemName,
  CKStatGroup,
  CKStat,
  ICKAttributesProps,
  CKAttributes,
  CKComment,
} from '@thewakingsands/kit-common'
import { ICKContext } from './CKContextProvider'

export interface ICKActionProps {
  name?: string
  id?: number | string
  jobId?: number
  pvp?: boolean
  onUpdate?: () => void
}

interface ICKActionState {
  data?: any
  error?: any
}

export class CKAction extends Component<ICKActionProps, ICKActionState> {
  public context: ICKContext

  public async componentDidMount() {
    await this.getData()
  }

  public async componentDidUpdate(prevProps: ICKActionProps) {
    if (this.props.onUpdate) {
      this.props.onUpdate()
    }

    if (prevProps.id !== this.props.id || prevProps.name !== this.props.name || prevProps.jobId !== this.props.jobId) {
      this.setState({ data: null, error: null })
      try {
        await this.getData()
      } catch (e) {
        this.setState({ error: e })
        console.error(e)
      }
    }
  }

  private async getData() {
    const id = await this.getId()
    if (!id) {
      return
    }

    const columns =
      'Icon,Name,Description,ActionCategory.Name,ClassJob.Name,MaxCharges,Range,Cast100ms,Recast100ms,ClassJobLevel,EffectRange,ClassJobCategory.Name'
    const res = await fetch(`${this.context.apiBaseUrl}/Action/${id}?columns=${columns}`)
    const json = await res.json()

    this.setState({ data: json })
  }

  private async getId() {
    if (this.props.id) {
      const numId = parseInt('' + this.props.id)
      if (!isNaN(numId)) {
        return numId
      }
    }

    if (!this.props.name) {
      this.setState({ error: `没有指定技能名字或 ID。` })
      return null
    }

    let url = `${this.context.apiBaseUrl}/search?indexes=Action&limit=1&string=${encodeURIComponent(
      this.props.name,
    )}&filters=ClassJobLevel>0,IsPvP=${this.props.pvp ? '1' : '0'}`
    if (this.props.jobId) {
      url = url + ',ClassJobTargetID=' + this.props.jobId
    }

    const res = await fetch(url)
    const json = await res.json()

    if (json.Results[0]) {
      return json.Results[0].ID
    }

    this.setState({ error: `没有找到技能“${this.props.name}”。` })
    return null
  }

  public render() {
    if (this.state.error) {
      return (
        <CKBox>
          <CKContainer>{this.state.error}</CKContainer>
        </CKBox>
      )
    }

    if (!this.state.data) {
      return (
        <CKBox>
          <CKContainer>Loading...</CKContainer>
        </CKBox>
      )
    }

    const {
      Icon,
      Name,
      Description,
      ActionCategory: { Name: ActionCategoryName },
      ClassJob: { Name: ClassJobName },
      ClassJobCategory: { Name: ClassJobCategoryName },
      MaxCharges,
      Range,
      Cast100ms,
      Recast100ms,
      ClassJobLevel,
      EffectRange,
    } = this.state.data

    const jobName = ClassJobName || ClassJobCategoryName
    const basicRange = ['舞者', '吟游诗人', '弓箭手', '机工士'].indexOf(jobName) > -1 ? 25 : 3
    const actionRange = Range < 0 ? basicRange : Range

    const ac: ICKAttributesProps = { attrs: [] }
    ac.attrs.push({ name: '范围', value: EffectRange + 'm', style: 'half' })
    ac.attrs.push({ name: '距离', value: actionRange + 'm', style: 'half' })
    ac.attrs.push({
      name: '习得等级',
      value: `${jobName} ${ClassJobLevel}级`,
      style: 'half-full',
    })
    if (MaxCharges) {
      ac.attrs.push({ name: '充能层数', value: MaxCharges, style: 'half-full' })
    }

    const iconUrl = `${this.context.iconBaseUrl}${Icon.replace(/^\/i/, '')}`

    // eslint-disable-next-line react/no-danger
    const descEl = <div dangerouslySetInnerHTML={{ __html: Description.replace(/\n/g, '<br/>') }} />

    const year = new Date().getFullYear()

    return (
      <CKBox>
        <div style={{ width: 320, padding: 8 }}>
          <CKContainer style={{ paddingBottom: 0 }}>
            <CKItemName name={Name} rarity={0} type={ActionCategoryName} size="medium" iconSrc={iconUrl} />
          </CKContainer>
          <div style={{ paddingTop: 6 }}>
            <CKStatGroup>
              <CKStat name="咏唱时间" value={parse100ms(Cast100ms)} />
              <CKStat name="复唱时间" value={parse100ms(Recast100ms)} />
            </CKStatGroup>
          </div>
          <CKContainer>{descEl}</CKContainer>
          <CKContainer>
            <CKAttributes {...ac} />
          </CKContainer>
          <CKComment>
            <p style={{ fontSize: '9px', textAlign: 'right', opacity: 0.6, userSelect: 'none' }}>
              {this.context.hideSeCopyright ? null : `© ${year} SQUARE ENIX CO., LTD. `}
              Powered by{' '}
              <a href="https://ffcafe.org/?utm_source=ckitem" target="_blank" rel="noopener noreferrer">
                FFCafe
              </a>
            </p>
          </CKComment>
        </div>
      </CKBox>
    )
  }
}

function parse100ms(time: number) {
  if (time === 0) {
    return '即时'
  }
  return time / 10 + '秒'
}
