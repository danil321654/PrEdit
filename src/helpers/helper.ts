import * as Yup from 'yup'
import Axios from 'axios'
import tinycolor from 'tinycolor2'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { flow, groupBy } from 'lodash-es'
import { List, Map, Record as ImmutableRecord } from 'immutable'

export function localFormat(date: Date, formatString: string) {
  return format(date, formatString, { locale: ru })
}

export function cap(str?: string) {
  if (str) {
    return str[0].toUpperCase() + str.slice(1)
  }
  return str
}

export function detailFormatDate(
  date: Date | undefined,
  ...formats: string[]
): (string | undefined)[] {
  if (!date) {
    return []
  }
  return formats.map(formatString => localFormat(date, formatString))
}

export function RGBToHex(rgb: string): string {
  const sep = rgb.indexOf(',') > -1 ? ',' : ' '
  const RGB = rgb.substr(4).split(')')[0].split(sep)

  let r = (+RGB[0]).toString(16),
    g = (+RGB[1]).toString(16),
    b = (+RGB[2]).toString(16)

  if (r.length === 1) r = '0' + r
  if (g.length === 1) g = '0' + g
  if (b.length === 1) b = '0' + b

  return '#' + r + g + b
}

export function hex2rgb(c: string): string {
  const bigint = parseInt(c.split('#')[1], 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgb(${r}, ${g}, ${b})`
}

export function cssToObj(css: string): Record<string, string> {
  const obj = {} as Record<string, string>,
    s = css
      .toLowerCase()
      ?.replace(/-(.)/g, function (m, g) {
        return g.toUpperCase()
      })
      ?.replace(/;\s?$/g, '')
      .split(/:|;/g)
  for (let i = 0; i < s.length; i += 2)
    obj[s[i].replace(/\s/g, '')] = s[i + 1]?.replace(/^\s+|\s+$/g, '')
  return obj
}

export const templateTitleSchema = Yup.object().shape({
  title: Yup.string()
    .required('Обязательное поле')
    .max(30, 'В названии шаблона должно быть не более 30 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ_:?"'.,№\-\d\s]+$/, 'Недопустимые символы')
    .transform(value => (!value.trim() ? value.trim() : value)),
})

export const mockApiClient = Axios.create()

export const toUpperCaseFirstChar = (text: string) => {
  return text[0].toUpperCase() + text.slice(1)
}

export const getHSLColor = (color: string) => tinycolor(color).toHslString()

export const getLightenHSLColor = (
  color: string,
  lightenScale: number,
  alpha = 1,
) => {
  const hslColor = getHSLColor(color)
  return tinycolor(hslColor).lighten(lightenScale).setAlpha(alpha).toString()
}

export const groupItemsByField = <E extends ImmutableRecord<any>>(
  list: List<E>,
  field: string,
) => {
  return groupBy(list.toArray(), item =>
    toUpperCaseFirstChar(localFormat(new Date(item.get(field)), 'LLLL yyyy')),
  )
}



export const flowAsync: typeof flow = (...fns: any[]) =>
  flow(
    ...fns.map(
      fn =>
        async (...args: unknown[]) =>
          fn(...(await Promise.all(args))),
    ),
  )
