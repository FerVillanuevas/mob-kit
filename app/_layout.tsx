import "~/global.css";

import { ObservablePersistMMKV } from "@legendapp/state/persist-plugins/mmkv";
import { syncObservable } from "@legendapp/state/sync";
import {
  DarkTheme,
  DefaultTheme,
  Theme,
  ThemeProvider,
} from "@react-navigation/native";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
  QueryKey,
  useQueries,
} from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { salesforceStore$ } from "~/integrations/salesforce/store";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorSchema";

import { KeyboardProvider } from "react-native-keyboard-controller";

import { SplashScreen, Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { toast, Toaster } from "sonner-native";
import { getBasketQueryOptions } from "~/integrations/salesforce/options/basket";
import { getCustomerQueryOptions } from "~/integrations/salesforce/options/customer";

syncObservable(salesforceStore$, {
  persist: {
    name: "persistKey",
    plugin: ObservablePersistMMKV,
  },
});

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

declare module "@tanstack/react-query" {
  interface Register {
    mutationMeta: {
      invalidateQuery?: QueryKey;
      sucessMessage?: string;
      errorMessage?: string;
    };
  }
}

SplashScreen.preventAutoHideAsync();

const RootComponent = () => {
  const [customer, basket] = useQueries({
    queries: [getCustomerQueryOptions(), getBasketQueryOptions()],
  });

  useEffect(() => {
    const hide = async () => {
      if (!customer.isLoading || !basket.isLoading) {
        await SplashScreen.hideAsync();
      }
    };

    hide();
  }, [customer, basket]);

  {
    /* Main Stack, all other routes will be pushed on top, like product */
  }
  return (
    <Stack>
      {/* (tabs)/index file, App entry point, see expo for reference */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(checkout)" options={{ title: "" }} />
    </Stack>
  );
};

export default function RootLayout() {
  const hasMounted = useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = useState(false);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
    mutationCache: new MutationCache({
      onSuccess: (_data, _variables, _context, mutation) => {
        if (mutation.meta?.sucessMessage) {
          toast.success(mutation.meta.sucessMessage);
        }
      },
      onError: (_data, _variables, _context, mutation) => {
        if (mutation.meta?.errorMessage) {
          toast.error(mutation.meta.errorMessage);
        }
      },
      onSettled: (_data, _error, _variables, _context, mutation) => {
        if (mutation.meta?.invalidateQuery) {
          queryClient.invalidateQueries({
            queryKey: mutation.meta.invalidateQuery,
          });
        }
      },
    }),
  });

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
          <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
          <QueryClientProvider client={queryClient}>
            <RootComponent />
            <Toaster />
          </QueryClientProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === "web" && typeof window === "undefined"
    ? useEffect
    : useLayoutEffect;
