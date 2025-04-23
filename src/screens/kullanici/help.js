import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Linking, Platform, Dimensions } from 'react-native';
import React, { useState } from 'react';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function Help({ navigation }) {
  const [expandedFaq, setExpandedFaq] = useState(null);


  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const renderContactMethods = () => (
    <View style={styles.contactMethodsContainer}>
      {contactMethods.map((method, index) => (
        <TouchableOpacity 
          key={index}
          style={styles.contactMethodBox}
          onPress={method.onPress}
        >
          <View style={[styles.iconCircle, { backgroundColor: method.bgColor }]}>
            <Ionicons name={method.icon} size={24} color="#fff" />
          </View>
          <Text style={styles.contactMethodTitle}>{method.title}</Text>
          <Text style={styles.contactMethodSubtitle}>{method.subtitle}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Yardım ve Destek</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Nasıl yardımcı olabiliriz?</Text>
          <Text style={styles.searchSubtitle}>Size en iyi şekilde destek olmak için buradayız</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bizimle İletişime Geçin</Text>
          {renderContactMethods()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          {faqData.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.faqItem}
              onPress={() => toggleFaq(index)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons 
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'} 
                  size={20} 
                  color="#666"
                />
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çalışma Saatlerimiz</Text>
          <View style={styles.workingHours}>
            <View style={styles.workingHoursItem}>
              <Text style={styles.workingDays}>Pazartesi - Cuma</Text>
              <Text style={styles.workingTime}>10:00 - 22:00</Text>
            </View>
            <View style={styles.workingHoursItem}>
              <Text style={styles.workingDays}>Cumartesi - Pazar</Text>
              <Text style={styles.workingTime}>10:00 - 22:00</Text>
            </View>
            <Text style={styles.workingHoursNote}>
              Pazar günleri yalnızca online destek hizmeti verilmektedir.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KVKK Aydınlatma Metni</Text>
          <Text style={styles.kvkkText}>
            Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmekte ve korunmaktadır. 
            Verilerinizin güvenliği bizim için önceliktir ve en üst düzeyde güvenlik önlemleri ile korunmaktadır.
          </Text>
          <TouchableOpacity style={styles.kvkkButton}  onPress={() => Linking.openURL('https://asebay.com.tr/rio-pp.html')}>
            <Text style={styles.kvkkButtonText}>Gizlilik Politikasını İncele</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.emergencySection}>
          <MaterialIcons name="warning" size={24} color="#FF6B6B" />
          <Text style={styles.emergencyText}>
            Acil durumlarda 7/24 müşteri hizmetlerimize ulaşabilirsiniz
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const contactMethods = [
  {
    icon: 'call-outline',
    title: 'Bizi Arayın',
    subtitle: '7/24 Destek Hattı',
    onPress: () => Linking.openURL('tel:+90'),
    bgColor: '#4CAF50'
  },
  {
    icon: 'mail-outline',
    title: 'E-posta Gönderin',
    subtitle: '24 Saat İçinde Yanıt',
    onPress: () => Linking.openURL('mailto:riocaffeehouse@gmail.com'),
    bgColor: '#2196F3'
  },
  {
    icon: 'logo-whatsapp',
    title: 'WhatsApp',
    subtitle: 'Hızlı Destek',
    onPress: () => Linking.openURL('whatsapp://send?phone=+90'),
    bgColor: '#25D366'
  },
  {
    icon: 'location-outline',
    title: 'Adresimiz',
    subtitle: 'Yol Tarifi Alın',
    onPress: () => Linking.openURL('https://maps.app.goo.gl/SnNDtgbdjnSSkRAT6'),
    bgColor: '#FF5722'
  }
];

const faqData = [
  {
    question: 'Şifremi nasıl değiştirebilirim?',
    answer: 'Profil sayfanızdan "Şifre Değiştir" seçeneğine tıklayarak şifrenizi güncelleyebilirsiniz. Güvenliğiniz için yeni şifrenizin en az 8 karakter uzunluğunda olması ve büyük/küçük harf ile rakam içermesi gerekmektedir.'
  },
  {
   question: 'Ürünlerinizde hangi alerjenler bulunmaktadır?',
    answer: 'Ürünlerimizde fındık, süt, soya, buğday ve diğer alerjenlerin izlerini içerebilir. Hazırlama sürecinde çapraz bulaşma riski bulunmaktadır.'
  },
  
];

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    padding: 8,
  },
  searchButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  searchSection: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  searchSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  contactMethodsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactMethodBox: {
    width: (width - 64) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactMethodSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  faqItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    paddingLeft: 8,
  },
  workingHours: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
  },
  workingHoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  workingDays: {
    fontSize: 14,
    color: '#444',
  },
  workingTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  workingHoursNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 8,
  },
  kvkkText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  kvkkButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  kvkkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emergencySection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  emergencyText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
});