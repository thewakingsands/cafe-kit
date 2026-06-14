import {
  CKAttributes,
  CKBox,
  CKComment,
  CKContainer,
  CKItemName,
  CKStat,
  CKStatGroup,
  type ICKAttribute,
  type ICKAttributesProps,
} from '@thewakingsands/kit-common'
import { useContext, useEffect, useRef, useState } from 'preact/hooks'
import { CKContext, type ICKContext } from './CKContextProvider'
import { HqButton } from './HqButton'
import { copyText } from './utils/copyText'
import { createXivApi, findXivRowId, normalizeItemRow } from './xivapi'

export interface ICKItemProps {
  name?: string
  id?: number | string
  hq?: boolean
  onUpdate?: () => void
}

const handleDetails = (name: string) => {
  window.open(
    `https://ff14.huijiwiki.com/wiki/${encodeURIComponent('物品')}:${encodeURIComponent(name)}`,
    '_blank',
    'noopener',
  )
}

function CKItemInner(props: { item: any; hq?: boolean }) {
  const { item } = props
  const {
    Name,
    Icon,
    ItemUICategory: { Name: CategoryName, ID: CategoryID },
    EquipSlotCategory,
    DamageMag,
    DamagePhys,
    DefenseMag,
    DefensePhys,
    BlockRate,
    Block,
    DelayMs,
    Bonuses,
    BaseParam0,
    ClassJobCategory,
    LevelEquip,
    LevelItem,
    Description,
    ClassJobRepair,
    ItemRepair,
    IsUnique,
    IsUntradable,
    CanBeHq,
    PriceLow,
    Rarity,
    MateriaSlotCount,
    IsAdvancedMeldingPermitted,
  } = item
  const [viewHQ, setViewHQ] = useState(false)
  const [copyMessage, setCopyMessage] = useState('')
  const { defaultHq, hideSeCopyright } = useContext(CKContext)

  const handleCopy = () => {
    copyText(item.Name)
    setCopyMessage('已复制')
    setTimeout(() => {
      setCopyMessage('')
    }, 1200)
  }

  const useHq = props.hq || viewHQ || defaultHq
  const hq = useHq && CanBeHq

  const children: any[] = []
  const ac: ICKAttributesProps = { attrs: [] }

  const iconUrl = Icon
  const iconUrlHq = iconUrl.replace(/(\d+\.png)/, 'hq/$1')

  const hqName = (
    <span>
      {Name}
      <HqButton hq={hq} onHqChange={setViewHQ} />
    </span>
  )

  const elItemName = (
    <CKItemName
      name={CanBeHq ? hqName : Name}
      rarity={Rarity}
      type={CategoryName}
      size="medium"
      iconSrc={hq ? iconUrlHq : iconUrl}
    />
  )

  if (EquipSlotCategory) {
    ac.attrs.push({ name: '品级', value: LevelItem, style: 'full' })
    ac.attrs.push({ name: '', style: 'header' })

    const stats: any[] = []
    const params: Record<number, { name: string; id: number; value: any }> = {
      12: { name: '物理基本性能', id: 12, value: DamagePhys },
      13: { name: '魔法基本性能', id: 13, value: DamageMag },
      14: { name: '攻击间隔', id: 14, value: DelayMs / 1000 },
      17: { name: '格挡发动力', id: 17, value: BlockRate },
      18: { name: '格挡性能', id: 18, value: Block },
      21: { name: '物理防御力', id: 21, value: DefensePhys },
      24: { name: '魔法防御力', id: 24, value: DefenseMag },
      99999: {
        name: '物理自动攻击',
        id: 99999,
        value: (m: Record<number, { value: any }>) =>
          parseFloat((((m[12].value || 0) / 3) * m[14].value).toFixed(2)),
      },
    }

    const statsToRender: number[] = []

    // 主手
    if (EquipSlotCategory.MainHand) {
      const magicUi = [6, 7, 8, 9, 10, 89, 97, 98]
      const isMagic = magicUi.indexOf(CategoryID) >= 0

      if (isMagic) {
        statsToRender.push(13)
      } else {
        statsToRender.push(12)
      }

      statsToRender.push(99999)
      statsToRender.push(14)
    } else if (EquipSlotCategory.OffHand) {
      // 副手，仅盾
      if (CategoryID === 11) {
        statsToRender.push(17)
        statsToRender.push(18)
      }
    } else {
      // 其他
      statsToRender.push(21)
      statsToRender.push(24)
    }

    // HQ 属性检查
    if (hq) {
      for (let i = 0; i <= 5; i++) {
        const tidKey = `BaseParamSpecial${i}TargetID`
        const valKey = `BaseParamValueSpecial${i}`

        if (!item[tidKey]) continue

        const tid = item[tidKey]
        const val = item[valKey]

        if (!params[tid]) continue

        params[tid].value += val
      }
    }

    for (const id of statsToRender) {
      const p = params[id]
      const v = typeof p.value === 'function' ? p.value(params) : p.value
      stats.push({ name: p.name, value: v })
    }

    if (stats.length) {
      children.push(
        <div style={{ paddingTop: 6 }}>
          <CKStatGroup>
            {stats.map((s) => (
              <CKStat {...s} />
            ))}
          </CKStatGroup>
        </div>,
      )
    }

    // 职业
    ac.attrs.push({
      name: ClassJobCategory.Name,
      style: 'full',
      titleClass: 'ck-success',
    })
    ac.attrs.push({
      name: `${LevelEquip}级以上`,
      style: 'full',
      titleClass: 'ck-success',
    })
  }

  if (Description) {
    ac.attrs.push({
      name: Description.replace(/\n+/g, '\n'),
      style: 'full',
      titleClass: '',
    })
  }

  // 特殊 - 装备
  if (BaseParam0) {
    ac.attrs.push({ name: '特殊', style: 'header' })

    const list: Array<ICKAttribute & { id: number }> = []
    for (let i = 0; i <= 5; i++) {
      const key = `BaseParam${i}`
      const valueKey = `BaseParamValue${i}`
      if (!item[key] || !item[valueKey]) {
        continue
      }

      const id = item[key].ID
      let value = item[valueKey]
      // HQ 属性检查
      if (hq) {
        for (let i = 0; i <= 5; i++) {
          const tidKey = `BaseParamSpecial${i}TargetID`
          const valKey = `BaseParamValueSpecial${i}`

          if (!item[tidKey]) {
            continue
          }

          const tid = item[tidKey]
          const val = item[valKey]

          if (tid !== item[key].ID) {
            continue
          }
          value += val
        }
      }

      list.push({
        name: item[key].Name,
        value: `+${value}`,
        style: 'half',
        id,
      })
    }

    ac.attrs.push(...list.sort((x, y) => x.id - y.id))
  }

  // 特殊 - 食物
  if (Bonuses) {
    ac.attrs.push({ name: '特殊', style: 'header' })
    if (hq) {
      for (const key in Bonuses) {
        const b = Bonuses[key]
        ac.attrs.push({
          name: key,
          value: `+${b.ValueHQ}%（上限 ${b.MaxHQ}）`,
          style: 'half-full',
        })
      }
    } else {
      for (const key in Bonuses) {
        const b = Bonuses[key]
        ac.attrs.push({
          name: key,
          value: `+${b.Value}%（上限 ${b.Max}）`,
          style: 'half-full',
        })
      }
    }
  }

  // 魔晶石工艺
  if (MateriaSlotCount) {
    ac.attrs.push({ name: '魔晶石工艺', style: 'header' })
    ac.attrs.push({
      name: '安全孔数',
      value: MateriaSlotCount,
      style: 'half',
    })
    ac.attrs.push({
      name: '禁断镶嵌',
      value: boolToString(IsAdvancedMeldingPermitted),
      style: 'half',
    })
  }

  // 制作&修理
  if (ClassJobRepair && ItemRepair) {
    ac.attrs.push({ name: '制作&修理', style: 'header' })

    const levelMeld = LevelEquip
    const levelRepair = Math.max(LevelEquip - 10, 1)

    ac.attrs.push({
      name: '修理等级',
      value: `${ClassJobRepair.Name} ${levelRepair}级以上`,
      style: 'full',
    })
    ac.attrs.push({
      name: '修理材料',
      value: ItemRepair.Item?.Name || ItemRepair.Name,
      style: 'full',
    })

    if (MateriaSlotCount) {
      ac.attrs.push({
        name: '镶嵌魔晶石等级',
        value: `${ClassJobRepair.Name} ${levelMeld}级以上`,
        style: 'full',
      })
    }
  }

  // 各种属性
  if (EquipSlotCategory) {
    ac.attrs.push({ name: '', style: 'header' })
    // 装备：魔晶石化、投影、部队徽记、染色、分解
    const keyMap = [
      ['IsDyeable', '染色'],
      ['IsCrestWorthy', '部队徽记'],
      ['Salvage', '分解'],
      ['Materialize', '魔晶石化'],
    ]
    for (const [key, name] of keyMap) {
      const value = item[key]
      ac.attrs.push({ name, value: boolToString(value), style: 'half' })
    }
  }

  // 警告
  if (PriceLow <= 0 || IsUntradable || IsUnique) {
    ac.attrs.push({ name: '', style: 'header' })

    if (PriceLow <= 0) {
      ac.attrs.push({
        name: '不可出售',
        style: 'half',
        titleClass: 'ck-warning',
      })
    }
    if (IsUntradable) {
      ac.attrs.push({
        name: '不可在市场出售',
        style: 'half',
        titleClass: 'ck-warning',
      })
    }
    if (IsUnique) {
      ac.attrs.push({
        name: '只能持有一个',
        style: 'half',
        titleClass: 'ck-warning',
      })
    }
  }

  children.push(
    <CKContainer>
      <CKAttributes {...ac} />
    </CKContainer>,
  )

  const year = new Date().getFullYear()

  return (
    <CKBox>
      <div style={{ width: 320, padding: 8 }}>
        <CKContainer style={{ paddingBottom: 0 }}>{elItemName}</CKContainer>
        {children}
        <CKContainer style={{ display: 'flex' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{ flex: 1 }}
            disabled={!!copyMessage}
          >
            {copyMessage || '复制道具名'}
          </button>
          <span style={{ width: 8 }} />
          <button onClick={() => handleDetails(item.Name)} style={{ flex: 1 }}>
            查看详情
          </button>
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

export function CKItem(props: ICKItemProps) {
  const context = useContext(CKContext)
  const [item, setItem] = useState<any>(null)
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

    setItem(null)
    setError(null)

    getItemData(props, context)
      .then((item) => {
        if (!ignore && item) {
          setItem(item)
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
  }, [props.id, props.name, context])

  if (error) {
    return (
      <CKBox>
        <CKContainer>{error.message || error}</CKContainer>
      </CKBox>
    )
  }

  if (!item) {
    return (
      <CKBox>
        <CKContainer>Loading...</CKContainer>
      </CKBox>
    )
  }

  return <CKItemInner item={item} />
}

async function getItemData(props: ICKItemProps, context: ICKContext) {
  const id = await getItemId(props, context)
  if (!id) {
    return null
  }

  const api = createXivApi(context)
  const json = await api.items.get(id)

  return normalizeItemRow(json)
}

async function getItemId(props: ICKItemProps, context: ICKContext) {
  if (props.id) {
    const numId = parseInt(`${props.id}`, 10)
    if (!Number.isNaN(numId)) {
      return numId
    }
  }

  if (!props.name) {
    throw new Error('没有指定物品名字或 ID。')
  }

  const api = createXivApi(context)
  const id = await findXivRowId(api, 'Item', props.name)

  if (id) {
    return id
  }

  throw new Error(`没有找到物品“${props.name}”。`)
}

function boolToString(v: boolean): string {
  return v ? '✓' : '×'
}
