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
import { hqSvg } from './hqIcon'
import { copyText } from './utils/copyText'
import { HqButton } from './HqButton'

export interface ICKItemProps {
  name?: string
  id?: number | string
  hq?: boolean
}

interface ICKItemState {
  item?: any
  error?: any
  copyMessage?: string
  hq?: boolean
}

export class CKItem extends Component<ICKItemProps, ICKItemState> {
  public context: ICKContext

  public async componentDidMount() {
    await this.getItemData()
  }

  public async componentWillUpdate(prevProps: ICKItemProps) {
    if (prevProps.id !== this.props.id || prevProps.name !== this.props.name) {
      try {
        await this.getItemData()
      } catch (e) {
        this.setState({ error: e })
        console.error(e)
      }
    }
  }

  private async getItemData() {
    const id = await this.getItemId()
    if (!id) {
      return
    }

    const res = await fetch(`${this.context.apiBaseUrl}/Item/${id}`)
    const json = await res.json()

    this.setState({ item: json })
  }

  private async getItemId() {
    if (this.props.id) {
      const numId = parseInt('' + this.props.id)
      if (!isNaN(numId)) {
        return numId
      }
    }

    if (!this.props.name) {
      this.setState({ error: `没有指定物品名字或 ID。` })
      return null
    }

    const res = await fetch(
      `${this.context.apiBaseUrl}/search?indexes=Item&limit=1&string=${encodeURIComponent(this.props.name)}`,
    )
    const json = await res.json()

    if (json.Results[0]) {
      return json.Results[0].ID
    }

    this.setState({ error: `没有找到物品“${this.props.name}”。` })
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

    if (!this.state.item) {
      return (
        <CKBox>
          <CKContainer>Loading...</CKContainer>
        </CKBox>
      )
    }

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
    } = this.state.item

    let useHq = this.props.hq != null ? this.props.hq : this.context.defaultHq
    if (this.state.hq != null) {
      useHq = this.state.hq
    }
    const hq = useHq && CanBeHq

    const children: any[] = []
    const ac: ICKAttributesProps = { attrs: [] }

    const iconUrl = `${this.context.iconBaseUrl}${Icon}`
    const iconUrlHq = iconUrl.replace(/(\d+\.png)/, 'hq/$1')

    const hqName = (
      <span>
        {Name}
        <HqButton hq={hq} onHqChange={this.handleHqChange} />
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

    // 装备

    if (EquipSlotCategory) {
      // 品级
      ac.attrs.push({ name: '品级', value: LevelItem, style: 'full' })
      ac.attrs.push({ name: '', style: 'header' })

      // 基本性能
      const stats: any[] = []

      const params = {
        12: {
          name: '物理基本性能',
          id: 12,
          value: DamagePhys,
        },
        13: {
          name: '魔法基本性能',
          id: 13,
          value: DamageMag,
        },
        14: {
          name: '攻击间隔',
          id: 14,
          value: DelayMs / 1000,
        },
        17: {
          name: '格挡发动力',
          id: 17,
          value: BlockRate,
        },
        18: {
          name: '格挡性能',
          id: 18,
          value: Block,
        },
        21: {
          name: '物理防御力',
          id: 21,
          value: DefensePhys,
        },
        24: {
          name: '魔法防御力',
          id: 24,
          value: DefenseMag,
        },
        99999: {
          name: '物理自动攻击',
          id: 99999,
          value: m => parseFloat((((m[12].value || 0) / 3) * m[14].value).toFixed(2)),
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

          if (!this.state.item[tidKey]) {
            continue
          }

          const tid = this.state.item[tidKey]
          const val = this.state.item[valKey]

          if (!params[tid]) {
            continue
          }

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
              {stats.map(s => (
                <CKStat {...s} />
              ))}
            </CKStatGroup>
          </div>,
        )
      }

      // 职业
      ac.attrs.push({ name: ClassJobCategory.Name, style: 'full', titleClass: 'ck-success' })
      ac.attrs.push({ name: LevelEquip + '级以上', style: 'full', titleClass: 'ck-success' })
    }

    if (Description) {
      ac.attrs.push({ name: Description.replace(/\n+/g, '\n'), style: 'full', titleClass: '' })
    }

    // 特殊 - 装备
    if (BaseParam0) {
      ac.attrs.push({ name: '特殊', style: 'header' })

      const list = []
      for (let i = 0; i <= 5; i++) {
        const key = `BaseParam${i}`
        const valueKey = `BaseParamValue${i}`
        if (!this.state.item[key] || !this.state.item[valueKey]) {
          continue
        }

        const id = this.state.item[key].ID
        let value = this.state.item[valueKey]
        // HQ 属性检查
        if (hq) {
          for (let i = 0; i <= 5; i++) {
            const tidKey = `BaseParamSpecial${i}TargetID`
            const valKey = `BaseParamValueSpecial${i}`

            if (!this.state.item[tidKey]) {
              continue
            }

            const tid = this.state.item[tidKey]
            const val = this.state.item[valKey]

            if (tid !== this.state.item[key].ID) {
              continue
            }
            value += val
          }
        }

        list.push({ name: this.state.item[key].Name, value: '+' + value, style: 'half', id })
      }

      list.sort((x, y) => x.id - y.id).forEach(x => ac.attrs.push(x))
    }

    // 特殊 - 食物
    if (Bonuses) {
      ac.attrs.push({ name: '特殊', style: 'header' })
      if (hq) {
        for (const key in Bonuses) {
          const b = Bonuses[key]
          ac.attrs.push({ name: key, value: `+${b.ValueHQ}%（上限 ${b.MaxHQ}）`, style: 'half-full' })
        }
      } else {
        for (const key in Bonuses) {
          const b = Bonuses[key]
          ac.attrs.push({ name: key, value: `+${b.Value}%（上限 ${b.Max}）`, style: 'half-full' })
        }
      }
    }

    // 魔晶石工艺
    if (MateriaSlotCount) {
      ac.attrs.push({ name: '魔晶石工艺', style: 'header' })
      ac.attrs.push({ name: '安全孔数', value: MateriaSlotCount, style: 'half' })
      ac.attrs.push({ name: '禁断镶嵌', value: boolToString(IsAdvancedMeldingPermitted), style: 'half' })
    }

    // 制作&修理
    if (ClassJobRepair) {
      ac.attrs.push({ name: '制作&修理', style: 'header' })

      const levelMeld = LevelEquip
      const levelRepair = Math.max(LevelEquip - 10, 1)

      ac.attrs.push({ name: '修理等级', value: `${ClassJobRepair.Name} ${levelRepair}级以上`, style: 'full' })
      ac.attrs.push({ name: '修理材料', value: ItemRepair.Name, style: 'full' })

      if (MateriaSlotCount) {
        ac.attrs.push({ name: '镶嵌魔晶石等级', value: `${ClassJobRepair.Name} ${levelMeld}级以上`, style: 'full' })
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
        const value = this.state.item[key]
        ac.attrs.push({ name, value: boolToString(value), style: 'half' })
      }
    }

    // 警告
    if (PriceLow <= 0 || IsUntradable || IsUnique) {
      ac.attrs.push({ name: '', style: 'header' })

      if (PriceLow <= 0) {
        ac.attrs.push({ name: '不可出售', style: 'half', titleClass: 'ck-warning' })
      }
      if (IsUntradable) {
        ac.attrs.push({ name: '不可在市场出售', style: 'half', titleClass: 'ck-warning' })
      }
      if (IsUnique) {
        ac.attrs.push({ name: '只能持有一个', style: 'half', titleClass: 'ck-warning' })
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
            <button onClick={this.handleCopy} style={{ flex: 1 }} disabled={!!this.state.copyMessage}>
              {this.state.copyMessage || '复制道具名'}
            </button>
            <span style={{ width: 8 }} />
            <button onClick={this.handleDetails} style={{ flex: 1 }}>
              查看详情
            </button>
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

  private handleDetails = () => {
    window.open(
      `https://ff14.huijiwiki.com/wiki/${encodeURIComponent('物品')}:${encodeURIComponent(this.state.item.Name)}`,
      '_blank',
      'noopener',
    )
  }

  private handleCopy = () => {
    copyText(this.state.item.Name)
    this.setState({ copyMessage: '已复制' })
    setTimeout(() => {
      this.setState({ copyMessage: null })
    }, 1200)
  }

  private handleHqChange = (hq: boolean) => {
    this.setState({ hq })
  }
}

function boolToString(v: boolean): string {
  return v ? '✓' : '×'
}
