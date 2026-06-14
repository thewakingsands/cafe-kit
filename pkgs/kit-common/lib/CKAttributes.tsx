export interface ICKAttribute {
  name: string
  value?: string | number
  titleClass?: string
  style: 'half' | 'full' | 'header' | 'half-full'
}

export interface ICKAttributesProps {
  attrs: ICKAttribute[]
}

export function CKAttributes(props: ICKAttributesProps) {
  return (
    <div class="ck-attrs">
      {props.attrs.map((attr) => (
        <div
          class={`ck-attrs-${attr.style} ${attr.name ? '' : 'ck-attrs-empty'}`}
        >
          <div
            class={[
              'ck-attrs-name',
              attr.titleClass == null ? 'ck-hl' : attr.titleClass,
            ].join(' ')}
          >
            {attr.name}
          </div>
          {attr.value ? <div class="ck-attrs-value">{attr.value}</div> : null}
        </div>
      ))}
    </div>
  )
}
