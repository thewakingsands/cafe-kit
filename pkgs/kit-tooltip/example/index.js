const { CKContextProvider, CKItem, CKAction, render, h } = CafeKitTooltip

const names = [
  '罗刹大盾',
  '罗刹学士手甲',
  '番茄炖蛋',
  '伽黎亚玩偶',
  '削脊拳',
  '安忒亚·优雷卡',
  '万辞全书·究极',
  '404',
]

for (const name of names) {
  const el = document.createElement('div')
  el.style.margin = '5px'

  render(
    h(
      CKContextProvider,
      {
        apiBaseUrl: 'https://cafemaker.wakingsands.com',
        iconBaseUrl: 'https://cafemaker.wakingsands.com/i',
        defaultHq: true,
        hideSeCopyright: false,
      },
      [h(CKItem, { name })],
    ),
    el,
  )

  document.getElementById('container1').appendChild(el)
}

const el = document.createElement('div')
el.style.margin = '5px'

render(
  h(
    CKContextProvider,
    {
      apiBaseUrl: 'https://cafemaker.wakingsands.com',
      iconBaseUrl: 'https://cafemaker.wakingsands.com/i',
      defaultHq: true,
      hideSeCopyright: false,
    },
    [
      h(CKAction, { name: '毁坏' }),
      h(CKAction, { name: '毁坏', jobId: 26 }),
      h(CKAction, { name: '魔续斩' }),
      h(CKAction, { name: '精准刺' }),
      h(CKAction, { name: '热分裂弹' }),
    ],
  ),
  el,
)

document.getElementById('container2').appendChild(el)
