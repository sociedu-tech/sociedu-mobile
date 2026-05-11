import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { Typography } from '../../src/components/typography/Typography';
import { theme } from '../../src/theme/theme';
import { Card } from '../../src/components/ui/Card';
import { TEXT } from '../../src/core/constants/strings';

export default function TermsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <View style={styles.container}>
      <LinearGradient colors={[theme.colors.primary, theme.colors.primaryDark]} style={styles.header}>
        <SafeAreaView edges={['top']}>
          <View style={styles.navBar}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Typography variant="h3" style={{ color: '#FFF', fontWeight: '800' }}>
              {TEXT.TERMS.HEADER_TITLE}
            </Typography>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* TABS */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'terms' && styles.activeTab]} 
          onPress={() => setActiveTab('terms')}
        >
          <Typography variant="bodyMedium" style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
            {TEXT.TERMS.TAB_TERMS}
          </Typography>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]} 
          onPress={() => setActiveTab('privacy')}
        >
          <Typography variant="bodyMedium" style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            {TEXT.TERMS.TAB_PRIVACY}
          </Typography>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.contentCard}>
          {activeTab === 'terms' ? <TermsContent /> : <PrivacyContent />}
        </Card>
        
        <Typography variant="caption" color="muted" align="center" style={styles.footerText}>
          Cập nhật lần cuối: 11/05/2026
        </Typography>
      </ScrollView>
    </View>
  );
}

function TermsContent() {
  return (
    <View>
      <Typography variant="h3" style={styles.contentTitle}>1. Chấp thuận điều khoản</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Bằng cách sử dụng ứng dụng Men Toree, bạn đồng ý tuân thủ và chịu sự ràng buộc bởi các điều khoản sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>2. Quyền và Trách nhiệm của Người dùng</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Người dùng cam kết cung cấp thông tin chính xác và chịu trách nhiệm bảo mật tài khoản của mình. Bạn không được sử dụng ứng dụng cho bất kỳ mục đích bất hợp pháp hoặc bị cấm nào.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>3. Giao dịch và Thanh toán</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Mọi giao dịch thanh toán gói dịch vụ Mentor phải được thực hiện thông qua hệ thống thanh toán chính thức của ứng dụng. Chúng tôi không chịu trách nhiệm cho các giao dịch bên ngoài hệ thống.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>4. Chính sách Hủy và Hoàn tiền</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Người dùng có quyền yêu cầu hoàn tiền nếu buổi học không diễn ra theo đúng cam kết của Mentor, tuân theo quy trình khiếu nại của hệ thống.
      </Typography>
    </View>
  );
}

function PrivacyContent() {
  return (
    <View>
      <Typography variant="h3" style={styles.contentTitle}>1. Thu thập thông tin</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Chúng tôi thu thập các thông tin cá nhân cần thiết để cung cấp dịch vụ như: Tên, Email, số điện thoại và thông tin học vấn/kinh nghiệm để tối ưu hóa trải nghiệm kết nối Mentor.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>2. Sử dụng thông tin</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Thông tin của bạn được sử dụng để: Cung cấp dịch vụ, xử lý thanh toán, gửi thông báo cập nhật và cải thiện chất lượng ứng dụng.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>3. Bảo mật dữ liệu</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Chúng tôi áp dụng các biện pháp bảo mật kỹ thuật và tổ chức để bảo vệ dữ liệu cá nhân của bạn khỏi việc truy cập, thay đổi hoặc tiêu hủy trái phép.
      </Typography>

      <Typography variant="h3" style={styles.contentTitle}>4. Chia sẻ với bên thứ ba</Typography>
      <Typography variant="bodyMedium" style={styles.paragraph}>
        Chúng tôi không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích tiếp thị mà không có sự đồng ý của bạn.
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { height: 120, paddingHorizontal: 20 },
  navBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  tabBar: { flexDirection: 'row', backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: theme.colors.border.light },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: theme.colors.primary },
  tabText: { color: theme.colors.text.secondary, fontWeight: '600' },
  activeTabText: { color: theme.colors.primary, fontWeight: '700' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  contentCard: { padding: 20, borderRadius: 28 },
  contentTitle: { marginTop: 24, marginBottom: 12, color: theme.colors.primary, fontWeight: '700' },
  paragraph: { lineHeight: 24, color: theme.colors.text.secondary },
  footerText: { marginTop: 30, opacity: 0.5 },
});
