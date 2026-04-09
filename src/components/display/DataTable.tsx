import React from 'react';
import { View, FlatList, StyleSheet, FlatListProps, ListRenderItemInfo, RefreshControl } from 'react-native';
import { Typography } from '../typography/Typography';
import { LoadingState } from '../states/LoadingState';
import { EmptyState } from '../states/EmptyState';
import { theme } from '../../theme/theme';

export interface Column<T> {
  id: string;
  label: string;
  flex?: number;      // e.g. 1, 2 for width ratios
  width?: number;     // fixed width if flex is not used
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
  accessor?: keyof T; // fallback if render is not provided
}

interface DataTableProps<T> extends Omit<FlatListProps<T>, 'renderItem' | 'ListHeaderComponent' | 'ListEmptyComponent'> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  emptyTitle = 'Không có dữ liệu',
  emptyDescription,
  style,
  contentContainerStyle,
  ...rest
}: DataTableProps<T>) {
  
  const renderHeader = () => (
    <View style={styles.headerRow}>
      {columns.map((col) => (
        <View 
          key={col.id} 
          style={[
            styles.cell, 
            col.flex ? { flex: col.flex } : { width: col.width || 100 },
            col.align && { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }
          ]}
        >
          <Typography variant="caption" color="secondary" numberOfLines={1} weight="600">
            {col.label.toUpperCase()}
          </Typography>
        </View>
      ))}
    </View>
  );

  const renderRow = ({ item, index }: ListRenderItemInfo<T>) => {
    return (
      <View style={[styles.row, index === data.length - 1 && styles.lastRow]}>
        {columns.map((col) => {
          let cellContent: React.ReactNode = null;
          
          if (col.render) {
            cellContent = col.render(item);
          } else if (col.accessor) {
            const val = item[col.accessor];
            cellContent = (
              <Typography variant="label" color="primary" numberOfLines={2}>
                {String(val ?? '')}
              </Typography>
            );
          }

          return (
            <View 
              key={`${col.id}-${index}`} 
              style={[
                styles.cell, 
                col.flex ? { flex: col.flex } : { width: col.width || 100 },
                col.align && { alignItems: col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start' }
              ]}
            >
              {cellContent}
            </View>
          );
        })}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <LoadingState fullScreen={false} message="Đang tải danh sách..." />;
    }
    return (
      <EmptyState 
        title={emptyTitle} 
        description={emptyDescription} 
        icon="file-tray-outline"
        fullScreen={false}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header cố định nằm ngoài FlatList để Header luôn ở trên cùng màn hình khi cuộn dọc */}
      {data.length > 0 && renderHeader()}
      
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContent, 
          data.length === 0 && styles.listEmptyContent,
          contentContainerStyle
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border.default,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.default,
    alignItems: 'center', // Canh giữa nội dung các cột theo chiều dọc
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  cell: {
    justifyContent: 'center',
    paddingRight: theme.spacing.sm,
  }
});
