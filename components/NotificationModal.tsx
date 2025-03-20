import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  useColorScheme,
  TouchableWithoutFeedback,
} from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, ColorScheme } from "@/constants/Colors";
import {
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  GestureHandlerRootView,
  HandlerStateChangeEvent,
} from "react-native-gesture-handler";

const { height } = Dimensions.get("window");
const MODAL_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = 50;

type NotificationData = {
  type: string;
  name: string;
  message: string;
  distance: string;
  coordinates: {
    lat: number;
    long: number;
  };
};

type NotificationModalProps = {
  isVisible: boolean;
  onClose: () => void;
  onOpenMaps: () => void;
  data: NotificationData | null;
};

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isVisible,
  onClose,
  onOpenMaps,
  data,
}) => {
  const colorScheme = useColorScheme() as ColorScheme | null;
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const slideAnim = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const [currentValue, setCurrentValue] = React.useState(0);

  React.useEffect(() => {
    const id = slideAnim.addListener((state) => {
      setCurrentValue(state.value);
    });

    return () => {
      slideAnim.removeListener(id);
    };
  }, []);

  const onGestureEvent = ({ nativeEvent }: PanGestureHandlerGestureEvent) => {
    if (nativeEvent.translationY > 0) {
      slideAnim.setValue(nativeEvent.translationY);
      fadeAnim.setValue(1 - nativeEvent.translationY / MODAL_HEIGHT);
    }
  };

  const onGestureEnd = () => {
    if (currentValue > SWIPE_THRESHOLD) {
      onClose();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.spring(fadeAnim, {
          toValue: 1,
          damping: 20,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  React.useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: MODAL_HEIGHT,
          damping: 20,
          mass: 1,
          stiffness: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible || !data) return null;

  const getIcon = (type: string) => {
    return type === "event" || type === "Event"
      ? "calendar-alert"
      : "train-variant";
  };

  const getTitle = (type: string) => {
    return type === "event" || type === "Event"
      ? "Event Alert"
      : "Station Closure Alert";
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <BlurView
            intensity={colorScheme === "dark" ? 40 : 80}
            tint={colorScheme === "dark" ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={({ nativeEvent }) => {
          if (nativeEvent.state === 5) {
            onGestureEnd();
          }
        }}
      >
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: colors.background,
              transform: [{ translateY: slideAnim }],
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <View style={styles.header}>
            <MaterialCommunityIcons
              name={getIcon(data.type)}
              size={32}
              color={colors.tint}
            />
            <Text style={[styles.title, { color: colors.text }]}>
              {getTitle(data.type)}
            </Text>
          </View>

          <View style={styles.content}>
            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={24}
                color={colors.tint}
              />
              <Text style={[styles.locationText, { color: colors.text }]}>
                {data.name}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="map-marker-distance"
                size={24}
                color={colors.tint}
              />
              <Text style={[styles.distanceText, { color: colors.text }]}>
                {data.distance}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <MaterialCommunityIcons
                name="information"
                size={24}
                color={colors.tint}
              />
              <Text style={[styles.messageText, { color: colors.text }]}>
                {data.message}
              </Text>
            </View>

            <View
              style={[styles.coordinates, { backgroundColor: colors.card }]}
            >
              <Text
                style={[styles.coordsText, { color: colors.textSecondary }]}
              >
                {`${data.coordinates.lat.toFixed(
                  5
                )}, ${data.coordinates.long.toFixed(5)}`}
              </Text>
            </View>
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.tint }]}
              onPress={onOpenMaps}
            >
              <MaterialCommunityIcons
                name="google-maps"
                size={24}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>Open in Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <MaterialCommunityIcons
                name="close"
                size={24}
                color={colors.text}
              />
              <Text style={[styles.buttonText, { color: colors.text }]}>
                Back to Radar
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 5,
  },
  modal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: MODAL_HEIGHT,
    padding: 20,
    zIndex: 1001,
    elevation: 6,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.18,
        shadowRadius: 4,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginLeft: 12,
  },
  content: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  locationText: {
    fontSize: 18,
    marginLeft: 12,
    flex: 1,
    fontWeight: "600",
  },
  distanceText: {
    fontSize: 18,
    marginLeft: 12,
    fontWeight: "600",
  },
  messageText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
  coordinates: {
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
  },
  coordsText: {
    fontSize: 14,
    textAlign: "center",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    gap: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 16,
    flex: 1,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
