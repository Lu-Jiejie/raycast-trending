import {
  Action,
  ActionPanel,
  Icon,
  List,
} from '@raycast/api'
import { useEffect } from 'react'

export default function Command() {
  useEffect(() => {

  }, [])

  return (
    <List
      actions={(
        <ActionPanel>
          <Action
            title="Refresh"
            icon={Icon.ArrowClockwise}
            onAction={() => console.log('refresh')}
          />
        </ActionPanel>
      )}
    >
      <List.Item
        title="Hello World"
        icon={{
          source: 'http://i0.hdslb.com/bfs/activity-plat/static/20221213/eaf2dd702d7cc14d8d9511190245d057/lrx9rnKo24.png',
        }}
        actions={(
          <ActionPanel>
            <Action.OpenInBrowser url="https://raycast.com" />
          </ActionPanel>
        )}
      />
    </List>
  )
}
