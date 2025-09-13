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
      {
        [1, 2, 3].map((item, index) => (<><List.Item key={index} title={`Item ${item}`} /></>))
      }
    </List>
  )
}
