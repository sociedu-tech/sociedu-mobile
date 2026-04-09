import { View } from 'react-native';
import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';

export default function MentorScreen() {
  return (
    <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center', backgroundColor: theme.colors.background }}>
      <Typography variant="h2" align="center" color="secondary">
        Danh sách Mentor (Blank)
      </Typography>
    </View>
  );
}
