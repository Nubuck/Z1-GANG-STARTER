import React from 'react'
import { task, Link } from '@z1/lib-feature-box'

// styles
import { css } from '../styles'

// main
export const HomeView = task(t => ({ ui: {} }) => ({ cmd, mutations }) => {
  return (
    <div className={css.container}>
      <h2 className={css.title}>HOME</h2>
      <div className={css.row}>
        <div className={css.col}>
          <Link to="/box-editor">UI BOX EDITOR</Link>
          <Link to="/view-editor">UI VIEW EDITOR</Link>
        </div>
      </div>
    </div>
  )
})