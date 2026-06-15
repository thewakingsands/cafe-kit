import {
  CKAttributes,
  CKBox,
  CKComment,
  CKContainer,
  CKItemName,
  CKStat,
  CKStatGroup,
  type ICKAttributesProps,
} from '@thewakingsands/kit-common'
import type XIVAPI from '@thewakingsands/xivapi-v2'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { CKContext, useXIVAPI } from './CKContextProvider'
import { type ActionRow, queryAction } from './xivapi/action'
import { findXivRowId } from './xivapi/common'

export interface ICKActionProps {
  name?: string
  id?: number | string
  jobId?: number
  pvp?: boolean
  onUpdate?: () => void
}

function CKActionInner({ data }: { data: ActionRow }) {
  const {
    fields: {
      Icon,
      Name,
      ActionCategory: {
        fields: { Name: ActionCategoryName },
      },
      ClassJob: {
        fields: { Name: ClassJobName },
      },
      ClassJobCategory: {
        fields: { Name: ClassJobCategoryName },
      },
      MaxCharges,
      Range,
      Cast100ms,
      Recast100ms,
      ClassJobLevel,
      EffectRange,
    },
    transient: { Description } = {},
  } = data
  const { hideSeCopyright } = useContext(CKContext)

  const jobName = ClassJobName || ClassJobCategoryName
  const basicRange =
    ['舞者', '吟游诗人', '弓箭手', '机工士'].indexOf(jobName) > -1 ? 25 : 3
  const actionRange = Range < 0 ? basicRange : Range

  const ac: ICKAttributesProps = { attrs: [] }
  ac.attrs.push({ name: '范围', value: `${EffectRange}m`, style: 'half' })
  ac.attrs.push({ name: '距离', value: `${actionRange}m`, style: 'half' })
  ac.attrs.push({
    name: '习得等级',
    value: `${jobName} ${ClassJobLevel}级`,
    style: 'half-full',
  })
  if (MaxCharges) {
    ac.attrs.push({ name: '充能层数', value: MaxCharges, style: 'half-full' })
  }

  const api = useXIVAPI()
  const iconUrl = api.formatIconUrl(Icon)

  const descEl = <div style={{ whiteSpace: 'pre-wrap' }}>{Description}</div>

  const year = new Date().getFullYear()

  return (
    <CKBox>
      <div style={{ width: 320, padding: 8 }}>
        <CKContainer style={{ paddingBottom: 0 }}>
          <CKItemName
            name={Name}
            rarity={0}
            type={ActionCategoryName}
            size="medium"
            iconSrc={iconUrl}
          />
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
          <p
            style={{
              fontSize: '9px',
              textAlign: 'right',
              opacity: 0.6,
              userSelect: 'none',
            }}
          >
            {hideSeCopyright ? null : `© ${year} SQUARE ENIX CO., LTD. `}
            Powered by{' '}
            <a
              href="https://ffcafe.org/?utm_source=ckitem"
              target="_blank"
              rel="noopener noreferrer"
            >
              FFCafe
            </a>
          </p>
        </CKComment>
      </div>
    </CKBox>
  )
}

export function CKAction(props: ICKActionProps) {
  const api = useXIVAPI()
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<any>(null)
  const didMountRef = useRef(false)

  useEffect(() => {
    if (didMountRef.current) {
      props.onUpdate?.()
    } else {
      didMountRef.current = true
    }
  })

  useEffect(() => {
    let ignore = false

    setData(null)
    setError(null)

    getActionData(api, props)
      .then((data) => {
        if (!ignore && data) {
          setData(data)
        }
      })
      .catch((e) => {
        if (!ignore) {
          setError(e)
          console.error(e)
        }
      })

    return () => {
      ignore = true
    }
  }, [props.id, props.name, props.jobId, props.pvp])

  if (error) {
    return (
      <CKBox>
        <CKContainer>{error.message || error}</CKContainer>
      </CKBox>
    )
  }

  if (!data) {
    return (
      <CKBox>
        <CKContainer>Loading...</CKContainer>
      </CKBox>
    )
  }

  return <CKActionInner data={data} />
}

async function getActionData(api: XIVAPI, props: ICKActionProps) {
  const id = await getActionId(api, props)
  if (!id) {
    return null
  }

  return queryAction(api, id)
}

async function getActionId(api: XIVAPI, props: ICKActionProps) {
  if (props.id) {
    const numId = parseInt(`${props.id}`, 10)
    if (!Number.isNaN(numId)) {
      return numId
    }
  }

  if (!props.name) {
    throw new Error('没有指定技能名字或 ID。')
  }

  const filters = ['ClassJobLevel>0', `IsPvP=${props.pvp ? 'true' : 'false'}`]
  if (props.jobId) {
    filters.push(`ClassJob=${props.jobId}`)
  }

  const id = await findXivRowId(api, 'Action', props.name, filters)

  if (id) {
    return id
  }

  throw new Error(`没有找到技能“${props.name}”。`)
}

function parse100ms(time: number) {
  if (time === 0) {
    return '即时'
  }
  return `${time / 10}秒`
}
