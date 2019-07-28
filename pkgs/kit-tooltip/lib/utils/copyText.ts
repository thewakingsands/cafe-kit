export function copyText(text: string) {
  const el = document.createElement('textarea')
  el.value = text
  el.style.width = '0'
  el.style.height = '0'
  el.style.opacity = '0'
  el.style.position = 'absolute'
  document.body.appendChild(el)

  el.select()
  const success = document.execCommand('copy')
  if (!success) {
    prompt('请手动复制以下内容', text)
  }

  document.body.removeChild(el)
}
