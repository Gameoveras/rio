import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Animated,
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import AppService from '../../api/api';

const { width, height } = Dimensions.get('window');

const theme = {
  colors: {
    primary: '#6F4E37',
    secondary: '#C4A484',
    accent: '#FFD700',
    text: {
      primary: '#3E2723',
      secondary: '#5D4037',
      light: '#FFFFFF',
    },
    background: {
      main: '#F5F5DC',
      secondary: '#EFEBE9',
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 16,
    lg: 24,
  },
};


const CampaignCard = ({ campaign, onPress }) => {
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));
  
  // Shadow için TAMAMEN AYRI bir Animated.Value
  const [shadowOpacity] = useState(new Animated.Value(0.1));
  const [shadowRadius] = useState(new Animated.Value(3));

  useEffect(() => {
    // SADECE Native Driver ile çalışan animasyonlar
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        speed: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    // Shadow animasyonları JS driver ile
    Animated.timing(shadowOpacity, {
      toValue: 0.3,
      duration: 150,
      useNativeDriver: false, 
    }).start();
    
    Animated.timing(shadowRadius, {
      toValue: 8,
      duration: 150,
      useNativeDriver: false,
    }).start();

    // Scale Native Driver ile
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    // Shadow animasyonları JS driver ile
    Animated.timing(shadowOpacity, {
      toValue: 0.1,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    Animated.timing(shadowRadius, {
      toValue: 3,
      duration: 200,
      useNativeDriver: false,
    }).start();

    // Scale Native Driver ile
    Animated.spring(scaleAnim, {
      toValue: 1,
      speed: 15,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View 
      style={[
        styles.cardShadowContainer,
        {
          shadowOpacity: shadowOpacity,
          shadowRadius: shadowRadius,
        }
      ]}
    >
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        
      
      <TouchableOpacity
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
      >
        <ImageBackground
          source={{ uri: `https://asebay.com.tr/moods/yonetici/uploads/${campaign.on_resmi}` }}
          style={styles.cardImage}
          resizeMode="cover"
        >
          {campaign.tur.toLowerCase() === 'yeni' && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>YENİ</Text>
            </View>
          )}
          <LinearGradient
            colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)']}
            style={styles.gradientOverlay}
          >
            <BlurView intensity={15} style={styles.blurContainer}>
              <Text style={styles.cardTitle} numberOfLines={1}>{campaign.baslik}</Text>
              <Text style={styles.cardDescription} numberOfLines={2}>{campaign.on_aciklama}</Text>
              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="white" />
                  <Text style={styles.dateText}>{campaign.tur.toUpperCase()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="white" />
              </View>
            </BlurView>
          </LinearGradient>
        </ImageBackground>
        
      </TouchableOpacity>
      
    </Animated.View>
    </Animated.View>
  );
};

export default function Kampanyalar() {
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = async () => {
    try {
      const response = await AppService.getkampanya();
      setCampaigns(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handlePressCampaign = (campaign) => {
    const item = campaign;
    navigation.navigate('promodetail', { item });
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../../../assets/images/arkaplanlar/profile.png')}
        style={styles.loadingContainer}
        resizeMode="cover"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Kampanyalar Yükleniyor...</Text>
      </ImageBackground>
    );
  }

  if (error) {
    return (
      <ImageBackground
        source={require('../../../assets/images/arkaplanlar/profile.png')}
        style={styles.errorContainer}
        resizeMode="cover"
      >
        <Ionicons name="sad-outline" size={48} color={theme.colors.primary} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchCampaigns}>
          <Text style={styles.retryText}>Tekrar Dene</Text>
        </TouchableOpacity>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/arkaplanlar/profile.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      
      {/* Header */}
      <BlurView intensity={90} tint="light" style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Özel Kampanyalar</Text>
       
      </BlurView>

      {/* Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            campaign={campaign}
            onPress={() => handlePressCampaign(campaign)}
          />
        ))}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.main,
  },
  header: {
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    zIndex: 100,
    backgroundColor: 'rgba(245, 245, 220, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: 0.5,
    right: 100,
   
  },
  filterButton: {
    padding: theme.spacing.xs,
  },
  scrollContainer: {
    paddingTop: 90,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  cardContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.lg,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginTop: 40,
  },
  cardImage: {
    width: '100%',
    height: height * 0.35,
  },
  gradientOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: theme.spacing.md,
  },
  blurContainer: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.light,
    marginBottom: theme.spacing.xs,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 13,
    color: theme.colors.text.light,
    marginLeft: theme.spacing.xs,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  badgeText: {
    color: theme.colors.text.primary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.text.primary,
    marginVertical: theme.spacing.md,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
  },
  retryText: {
    color: theme.colors.text.light,
    fontWeight: '600',
    fontSize: 15,
  },
  cardShadowContainer: {
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: 'transparent',
    marginTop: 30,
  },
  cardContainer: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
});