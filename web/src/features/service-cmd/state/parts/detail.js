import { task } from '@z1/lib-feature-box'

// main
export const detailCmd = task((t, a, r) => ({
  initial: {
    detailSubsribed: false,
  },
  mutations(m) {
    return [
      m(['detailSub', 'detailUnsub'], (state, action) =>
        t.merge(state, { detailSubsribed: action.payload })
      ),
    ]
  },
  effects(fx, { mutations, actions }) {
    return [
      fx(
        actions.routeViewDetail,
        ({ action$, cancelled$ }, dispatch, done) => {
          dispatch(mutations.detailSub(true))
          action$
            .pipe(
              r.filter(action =>
                t.and(
                  t.eq(action.type, actions.exitRoute),
                  t.eq(action.payload.route, actions.routeViewDetail)
                )
              ),
              r.tap(() => {
                dispatch(mutations.detailUnsub(false))
                done()
              }),
              r.takeUntil(cancelled$)
            )
            .subscribe()
        },
        {
          cancelType: actions.detailUnsub,
          warnTimeout: 0,
          latest: true,
        }
      ),
      fx(
        actions.detailSub,
        ({ getState, api }) => {
          return r.fromEvent(api.service('service-cmd'), 'patched').pipe(
            r.filter(service =>
              t.eq(
                service._id,
                t.pathOr(
                  null,
                  ['serviceCmd', 'views', 'DETAIL', 'data', 'service', '_id'],
                  getState()
                )
              )
            ),
            r.map(service =>
              mutations.dataChange({
                data: { service, event: 'patched' },
              })
            )
          )
        },
        {
          cancelType: actions.detailUnsub,
          warnTimeout: 0,
          latest: true,
        }
      ),
    ]
  },
}))
