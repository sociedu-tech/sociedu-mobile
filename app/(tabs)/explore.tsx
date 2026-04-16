import { Image } from 'expo-image';
import { Platform } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { Typography } from '../../src/components/typography/Typography';
import { Section } from '../../src/components/ui/Section';
import { theme } from '../../src/theme/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ExploreScreen() {
  return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: theme.colors.surface, dark: theme.colors.surface }}
        headerImage={
          <IconSymbol
            size={310}
            color={theme.colors.border.default}
            name="chevron.left.forwardslash.chevron.right"
            style={{ position: 'absolute', bottom: -90, left: -35 }}
          />
        }
      >
        <Section style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
          <Typography variant="h1">Explore</Typography>
        </Section>
        <Typography variant="body">This app includes example code to help you get started.</Typography>
        <Collapsible title="File-based routing">
          <Typography variant="body">
            This app has two screens: <Typography variant="bodyMedium">app/(tabs)/index.tsx</Typography> and <Typography variant="bodyMedium">app/(tabs)/explore.tsx</Typography>
          </Typography>
          <Typography variant="body">
            The layout file in <Typography variant="bodyMedium">app/(tabs)/_layout.tsx</Typography> sets up the tab navigator.
          </Typography>
          <ExternalLink href="https://docs.expo.dev/router/introduction">
            <Typography variant="bodyMedium" style={{ color: theme.colors.primary }}>Learn more</Typography>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Android, iOS, and web support">
          <Typography variant="body">You can open this project on Android, iOS, and the web. To open the web version, press <Typography variant="bodyMedium">w</Typography> in the terminal running this project.</Typography>
        </Collapsible>
        <Collapsible title="Images">
          <Typography variant="body">For static images, you can use the <Typography variant="bodyMedium">@2x</Typography> and <Typography variant="bodyMedium">@3x</Typography> suffixes to provide files for different screen densities</Typography>
          <Image
            source={require('@/assets/images/react-logo.png')}
            style={{ width: 100, height: 100, alignSelf: 'center', marginVertical: theme.spacing.md }}
          />
          <ExternalLink href="https://reactnative.dev/docs/images">
            <Typography variant="bodyMedium" style={{ color: theme.colors.primary }}>Learn more</Typography>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Light and dark mode components">
          <Typography variant="body">This template has light and dark mode support. The <Typography variant="bodyMedium">useColorScheme()</Typography> hook lets you inspect what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.</Typography>
          <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
            <Typography variant="bodyMedium" style={{ color: theme.colors.primary }}>Learn more</Typography>
          </ExternalLink>
        </Collapsible>
        <Collapsible title="Animations">
          <Typography variant="body">This template includes an example of an animated component. The <Typography variant="bodyMedium">components/HelloWave.tsx</Typography> component uses the powerful <Typography variant="bodyMedium">react-native-reanimated</Typography> library to create a waving hand animation.</Typography>
          {Platform.select({
            ios: (
              <Typography variant="body">
                The <Typography variant="bodyMedium">components/ParallaxScrollView.tsx</Typography> component provides a parallax effect for the header image.
              </Typography>
            ),
          })}
        </Collapsible>
      </ParallaxScrollView>
    );
  }


