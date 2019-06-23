import React from 'react'
import { task } from '@z1/lib-feature-box'
import { uiBox } from '@z1/lib-ui-box-tailwind'

// Box
export const Box = task(t => props => {
  const Element = t.pathOr('div', ['as'], props)
  const box = t.pathOr(null, ['box'], props)
  const stretch = t.pathOr(null, ['stretch'], props)
  const stretchProps = t.isNil(stretch)
    ? {}
    : {
        alignSelf: 'stretch',
        flex: 'auto',
      }
  return React.createElement(
    Element,
    t.merge(t.omit(['as', 'box', 'children', 'className'], props), {
      className: t.and(t.isNil(box), t.isNil(stretch))
        ? t.pathOr('', ['className'], props)
        : uiBox(box || {})
            .next(stretchProps)
            .next({
              className: t.pathOr(box.className || '', ['className'], props),
            })
            .toCss(),
    }),
    t.pathOr([], ['children'], props)
  )
})

// Stack
const Stack = task(t => direction => props => {
  const stackProps = {
    flexDirection: t.eq(direction, 'vertical') ? 'col' : 'row',
  }
  const alignX = t.pathOr(null, ['x'], props)
  const alignY = t.pathOr(null, ['y'], props)
  const alignProps = t.isNil(alignX)
    ? {}
    : t.eq(direction, 'vertical')
    ? {
        flex: 'auto',
        alignItems: t.getMatch(alignX)({
          left: 'start',
          center: 'center',
          right: 'end',
        }),
      }
    : {
        alignItems: t.getMatch(alignX)({
          top: 'start',
          center: 'center',
          bottom: 'end',
        }),
      }
  const justifyProps = t.isNil(alignY)
    ? {}
    : t.eq(direction, 'vertical')
    ? {
        justifyContent: t.getMatch(alignY)({
          top: 'start',
          center: 'center',
          bottom: 'end',
        }),
      }
    : {
        justifyContent: t.getMatch(alignY)({
          left: 'start',
          center: 'center',
          right: 'end',
        }),
      }
  const stretch = t.pathOr(null, ['stretch'], props)
  const stretchProps = t.isNil(stretch)
    ? {}
    : t.eq(direction, 'vertical')
    ? {
        height: 'full',
      }
    : {}

  return React.createElement(
    Box,
    t.merge(t.omit(['children', 'box'], props), {
      box: t.mergeAll([
        {
          display: 'flex',
          alignSelf: 'stretch',
        },
        stackProps,
        alignProps,
        justifyProps,
        stretchProps,
        t.pathOr({}, ['box'], props),
      ]),
    }),
    t.pathOr([], ['children'], props)
  )
})

export const VStack = Stack('vertical')
export const HStack = Stack('horizontal')

// Grid
export const Row = task(t => props =>
  React.createElement(
    HStack,
    t.merge(t.omit(['children', 'box'], props), {
      box: t.merge({ flexWrap: true }, t.pathOr({}, ['box'], props)),
    }),
    t.pathOr([], ['children'], props)
  )
)

const colWidth = task(t => width =>
  t.isNil(width) ? width : t.gte(width, 12) ? 'full' : `${width}/12`
)
export const Col = task(t => props =>
  React.createElement(
    VStack,
    t.merge(t.omit(['children', 'box'], props), {
      box: t.merge(
        {
          flex: 'none',
          width: [
            colWidth(t.pathOr(null, ['xs'], props)),
            {
              sm: colWidth(t.pathOr(null, ['sm'], props)),
              md: colWidth(t.pathOr(null, ['md'], props)),
              lg: colWidth(t.pathOr(null, ['lg'], props)),
              xl: colWidth(t.pathOr(null, ['xl'], props)),
            },
          ],
        },
        t.pathOr({}, ['box'], props)
      ),
    }),
    t.pathOr([], ['children'], props)
  )
)

// Spacer
export const Spacer = task(t => props =>
  React.createElement(
    Box,
    t.merge(t.omit(['box'], props), {
      box: t.merge({ flex: 1 }, t.pathOr({}, ['box'], props)),
    })
  )
)

// Icon
export const Icon = task(t => props => {
  const as = t.pathOr('i', ['as'], props)
  const prefix = t.pathOr('eva', ['prefix'], props)
  const icon = t.pathOr('', ['name'], props)
  const fontSize = t.pathOr(null, ['size'], props)
  const color = t.pathOr(null, ['color'], props)
  const className = t.pathOr(null, ['className'], props)
  return React.createElement(
    Box,
    t.merge(
      t.omit(['as', 'prefix', 'className', 'name', 'size', 'color'], props),
      {
        as,
        className: `${prefix} ${prefix}-${icon}${
          t.isNil(className) ? '' : ` ${className}`
        }`,
        box: t.merge(
          {
            fontSize,
            color,
          },
          t.pathOr({}, ['box'], props)
        ),
      }
    )
  )
})

// Text
export const Text = task(t => props => {
  const as = t.pathOr('span', ['as'], props)
  const fontSize = t.pathOr(null, ['size'], props)
  const fontFamily = t.pathOr(null, ['family'], props)
  const fontWeight = t.pathOr(null, ['weight'], props)
  const color = t.pathOr(null, ['color'], props)
  const fontSmoothing = t.pathOr(null, ['smooth'], props)
  const letterSpacing = t.pathOr(null, ['spacing'], props)
  const lineHeight = t.pathOr(null, ['height'], props)
  const textAlignX = t.pathOr(null, ['x'], props)
  const textAlignY = t.pathOr(null, ['y'], props)
  const textDecoration = t.pathOr(null, ['decoration'], props)
  const textTransform = t.pathOr(null, ['transform'], props)
  const whitespace = t.pathOr(null, ['space'], props)
  const wordBreak = t.pathOr(null, ['break'], props)
  const className = t.pathOr(null, ['className'], props)
  return React.createElement(
    Box,
    t.merge(
      t.omit(
        [
          'as',
          'className',
          'box',
          'size',
          'family',
          'weight',
          'color',
          'smooth',
          'spacing',
          'height',
          'x',
          'y',
          'decoration',
          'transform',
          'space',
          'break',
        ],
        props
      ),
      {
        as,
        className,
        box: t.merge(
          {
            fontSize,
            fontFamily,
            fontWeight,
            color,
            fontSmoothing,
            letterSpacing,
            lineHeight,
            textAlignX,
            textAlignY,
            textDecoration,
            textTransform,
            whitespace,
            wordBreak,
          },
          t.pathOr({}, ['box'], props)
        ),
      }
    )
  )
})

// Spinner
export const Spinner = task(t => props => {
  const size = t.pathOr(null, ['size'], props)
  const color = t.pathOr(null, ['color'], props)
  const className = t.pathOr(null, ['className'], props)
  return React.createElement(
    Box,
    t.merge(t.omit(['className', 'size', 'color'], props), {
      className: `spinner ${t.isNil(size) ? '' : ` spinner-${size}`} ${
        t.isNil(className) ? '' : ` ${className}`
      }`,
      box: t.merge(
        {
          color,
        },
        t.pathOr({}, ['box'], props)
      ),
    })
  )
})

// Button
export const Button = task(t => props => {})

// Input
export const Input = task(t => props => {})

// Select
export const Select = task(t => props => {})

// Checkbox
export const Checkbox = task(t => props => {})

// Radio
export const Radio = task(t => props => {})

// meta
export const Match = task(t => props => {
  const cases = t.pathOr({}, ['cases'], props)
  const handleCases = t.pathOr({}, ['handleCases'], props)
  const value = t.pathOr(null, ['value'], props)
  const nextProps = t.omit(['value', 'cases', 'handleCases'], props)
  const matched = t.has(value)(cases)
    ? { render: cases[value], type: 'value' }
    : t.has(value)(handleCases)
    ? { render: handleCases[value], type: 'handler' }
    : null
  const nextElseCase = t.isNil(matched)
    ? t.has('_')(cases)
      ? { render: cases['_'], type: 'value' }
      : t.has('_')(handleCases)
      ? { render: handleCases['_'], type: 'handler' }
      : null
    : null
  const nextMatched = t.and(t.isNil(matched), t.isNil(nextElseCase))
    ? null
    : t.isNil(matched)
    ? nextElseCase
    : matched
  return t.isNil(nextMatched)
    ? null
    : t.eq(nextMatched.type, 'value')
    ? nextMatched.render
    : React.createElement(nextMatched.render, nextProps)
})
