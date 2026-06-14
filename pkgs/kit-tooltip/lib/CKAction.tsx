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
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { CKContext, type ICKContext } from './CKContextProvider'
import { createXivApi, findXivRowId, normalizeActionRow } from './xivapi'

export interface ICKActionProps {
  name?: string
  id?: number | string
  jobId?: number
  pvp?: boolean
  onUpdate?: () => void
}

function CKActionInner({ data }: { data: any }) {
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

  const iconUrl = Icon

  // eslint-disable-next-line react/no-danger
  const descEl = (
    <div
      dangerouslySetInnerHTML={{
        __html: Description.replace(/\n/g, '<br/>'),
      }}
    />
  )

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
  const context = useContext(CKContext)
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

    getActionData(props, context)
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
  }, [props.id, props.name, props.jobId, props.pvp, context])

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

async function getActionData(props: ICKActionProps, context: ICKContext) {
  const id = await getActionId(props, context)
  if (!id) {
    return null
  }

  const api = createXivApi(context)
  const json = await api.data.sheets().get('Action', id.toString(), {
    fields:
      'Icon,Name,Description,ActionCategory,ClassJob,MaxCharges,Range,Cast100ms,Recast100ms,ClassJobLevel,EffectRange,ClassJobCategory',
  })

  return normalizeActionRow(json)
}

async function getActionId(props: ICKActionProps, context: ICKContext) {
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

  const api = createXivApi(context)
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
