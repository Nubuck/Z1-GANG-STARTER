import { task, createStateBox, NOT_FOUND } from '@z1/lib-feature-box'
import { matchedNavItem } from '@z1/lib-ui-schema'

// tasks
import {
  isPathInTopSchema,
  topSchemaWithoutPath,
  updateSchemaInPlace,
} from './tasks'

// ctx
const NAV_MODE = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
}

const NAV_STATUS = {
  INIT: 'init',
  OPEN: 'open',
  CLOSED: 'closed',
}

const NAV_WIDTH = {
  PRIMARY: 80,
  SECONDARY: 240,
}

// main
export const navState = task((t, a) =>
  createStateBox({
    name: 'nav',
    initial: {
      title: '',
      status: NAV_STATUS.INIT,
      mode: NAV_MODE.PRIMARY,
      schema: [],
      matched: null,
      width: NAV_WIDTH.PRIMARY,
      size: 'xs',
      primary: {
        width: NAV_WIDTH.PRIMARY,
        items: [],
        actions: [],
        left: 0,
      },
      secondary: {
        width: NAV_WIDTH.SECONDARY,
        items: [],
        left: 0,
      },
      body: {
        items: [],
        left: 0,
      },
    },
    mutations(m) {
      return [
        m(['navSchemaAdd'], (state, action) => {
          return t.merge(state, {
            schema: t.concat(
              state.schema,
              t.filter(
                schemaItem =>
                  t.not(isPathInTopSchema(schemaItem.path, state.schema || [])),
                t.pathOr([], ['payload', 'schema'], action)
              ) || []
            ),
          })
        }),
        m(['navSchemaUpdate'], (state, action) => {
          return t.merge(state, {
            schema: updateSchemaInPlace(
              t.pathOr([], ['payload', 'schema'], action),
              state.schema
            ),
          })
        }),
        m(['navSchemaRemove'], (state, action) => {
          return t.merge(state, {
            schema: topSchemaWithoutPath(
              t.pathOr([], ['payload', 'schema'], action),
              state.schema
            ),
          })
        }),
        m(['navChange'], (state, action) => {
          return t.merge(state, {
            title: t.pathOr(state.title, ['payload', 'title'], action),
            status: t.pathOr(state.status, ['payload', 'status'], action),
            mode: t.pathOr(state.mode, ['payload', 'mode'], action),
            width: t.pathOr(state.width, ['payload', 'width'], action),
            size: t.pathOr(state.size, ['payload', 'size'], action),
          })
        }),
        m(['navMatch'], (state, action) => {
          return t.merge(state, {
            title: t.pathOr(state.title, ['payload', 'title'], action),
            status: t.pathOr(state.status, ['payload', 'status'], action),
            mode: t.pathOr(state.mode, ['payload', 'mode'], action),
            width: t.pathOr(state.width, ['payload', 'width'], action),
            matched: t.pathOr(state.matched, ['payload', 'matched'], action),
            primary: t.merge(state.primary, {
              items: t.pathOr(
                state.primary.items,
                ['payload', 'primary', 'items'],
                action
              ),
              actions: t.pathOr(
                state.primary.actions,
                ['payload', 'primary', 'actions'],
                action
              ),
            }),
            secondary: t.merge(state.secondary, {
              items: t.pathOr(
                state.secondary.items,
                ['payload', 'secondary', 'items'],
                action
              ),
              actions: t.pathOr(
                state.secondary.actions,
                ['payload', 'secondary', 'actions'],
                action
              ),
            }),
            body: t.merge(state.body, {
              items: t.pathOr(
                state.body.items,
                ['payload', 'body', 'items'],
                action
              ),
            }),
          })
        }),
      ]
    },
    effects(fx, { actions, mutations }) {
      return [
        fx(['screen/RESIZE'], async ({ getState }, dispatch, done) => {
          const state = getState()
          const status = t.pathOr(null, ['nav', 'status'], state)
          const size = t.pathOr('xs', ['screen', 'size'], state)
          const navSize = t.pathOr('xs', ['nav', 'size'], state)
          const nextStatus = t.not(t.or(t.eq(size, 'lg'), t.eq(size, 'xl')))
            ? t.eq(status, NAV_STATUS.INIT)
              ? NAV_STATUS.CLOSED
              : status
            : NAV_STATUS.INIT
          if (
            t.or(t.not(t.eq(status, nextStatus)), t.not(t.eq(size, navSize)))
          ) {
            dispatch(mutations.navChange({ status: nextStatus, size }))
          }
          done()
        }),
        fx(
          [
            t.globrex('*/ROUTE_*').regex,
            NOT_FOUND,
            actions.navSchemaAdd,
            actions.navSchemaUpdate,
            actions.navSchemaRemove,
          ],
          async ({ getState }, dispatch, done) => {
            const state = getState()
            const routePath = t.pathOr('', ['location', 'pathname'], state)
            const schema = t.pathOr([], ['nav', 'schema'], state)
            const matched = t.pathOr(null, ['nav', 'matched'], state)
            const title = t.pathOr('', ['nav', 'title'], state)

            // search
            const nextMatch = matchedNavItem(routePath, schema)

            // validate match
            const validMatch = t.not(nextMatch)
              ? t.not(matched)
                ? nextMatch
                : t.contains(routePath, matched.path)
                ? matched
                : nextMatch
              : t.or(
                  t.isNil(nextMatch.children),
                  t.isZeroLen(nextMatch.children || [])
                )
              ? matched
                ? t.contains(routePath, matched.path)
                  ? matched
                  : matchedNavItem(nextMatch.parentPath, schema)
                : matchedNavItem(nextMatch.parentPath, schema)
              : nextMatch

            // compute layout

            const nextMode = t.isNil(validMatch)
              ? NAV_MODE.PRIMARY
              : t.or(
                  t.isNil(validMatch.children),
                  t.isZeroLen(validMatch.children)
                )
              ? NAV_MODE.PRIMARY
              : NAV_MODE.SECONDARY

            const primary = t.reduce(
              (data, item) => {
                const isAction = t.eq(
                  t.pathOr('nav', ['target'], item),
                  'action'
                )
                return t.merge(data, {
                  items: isAction ? data.items : t.concat(data.items, [item]),
                  actions: t.not(isAction)
                    ? data.actions
                    : t.concat(data.actions, [item]),
                })
              },
              { items: [], actions: [] },
              schema
            )

            const secondary = {
              items: t.isNil(validMatch) ? [] : validMatch.children,
              actions: [],
            }

            // mutate
            dispatch(
              mutations.navMatch({
                matched: validMatch,
                mode: nextMode,
                title: t.isNil(validMatch) ? title : validMatch.title,
                width: t.getMatch(nextMode)({
                  [NAV_MODE.PRIMARY]: NAV_WIDTH.PRIMARY,
                  [NAV_MODE.SECONDARY]: NAV_WIDTH.PRIMARY + NAV_WIDTH.SECONDARY,
                }),
                primary,
                secondary,
              })
            )
            // finally
            done()
          }
        ),
      ]
    },
  })
)
