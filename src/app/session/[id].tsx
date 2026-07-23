/**
 * Chat Screen
 * Individual session chat interface with streaming
 */

import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Send, Square, Copy, Share2, MoreVertical } from 'lucide-react-native';
import { useMessages, useSendMessage, useAbortSession } from '../../hooks/useApi';
import { useAppStore } from '../../store';
import { getThemeColors } from '../../theme';
import { storage } from '../../storage/mmkv';
import type { Message, TextPart } from '../../network/types';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const themeName = storage.getTheme() as 'dark' | 'light' | 'system';
  const theme = getThemeColors(themeName);

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: messages, isLoading } = useMessages(id!);
  const sendMessage = useSendMessage();
  const abortSession = useAbortSession();
  const { streamingMessageId, streamingContent } = useAppStore();

  const isStreaming = streamingMessageId !== null;

  useEffect(() => {
    if (messages && messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || !id) return;

    const message = input.trim();
    setInput('');

    try {
      await sendMessage.mutateAsync({ sessionId: id, content: message });
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAbort = async () => {
    if (!id) return;
    try {
      await abortSession.mutateAsync(id);
    } catch (error) {
      console.error('Failed to abort:', error);
    }
  };

  const getMessageText = (message: Message): string => {
    return message.parts
      .filter((part): part is TextPart => part.type === 'text')
      .map((part) => part.text)
      .join('');
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    const isAssistant = item.role === 'assistant';
    const text = getMessageText(item);
    const isStreamingMessage = isStreaming && item.id === streamingMessageId;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.assistantMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? theme.primary : theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              { color: isUser ? theme.primaryText : theme.text },
            ]}
          >
            {isStreamingMessage ? streamingContent || text : text}
          </Text>
          {isStreamingMessage && (
            <ActivityIndicator color={theme.primary} size="small" style={styles.typingIndicator} />
          )}
        </View>
        {isAssistant && text && (
          <View style={styles.messageActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Copy size={14} color={theme.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Share2 size={14} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
          Chat
        </Text>
        <TouchableOpacity style={styles.moreBtn}>
          <MoreVertical size={20} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      {isLoading ? (
        <ActivityIndicator color={theme.primary} style={styles.loader} />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages || []}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      {/* Input */}
      <View style={[styles.inputContainer, { borderTopColor: theme.border, paddingBottom: insets.bottom }]}>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bgTertiary, color: theme.text, borderColor: theme.border }]}
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={4000}
          editable={!isStreaming}
        />
        {isStreaming ? (
          <TouchableOpacity style={[styles.sendBtn, { backgroundColor: theme.danger }]} onPress={handleAbort}>
            <Square size={20} color="#ffffff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: input.trim() ? theme.primary : theme.bgTertiary }]}
            onPress={handleSend}
            disabled={!input.trim() || sendMessage.isPending}
          >
            <Send size={20} color={input.trim() ? theme.primaryText : theme.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  moreBtn: {
    padding: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  typingIndicator: {
    marginTop: 8,
  },
  messageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  actionBtn: {
    padding: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    fontSize: 15,
    maxHeight: 120,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
