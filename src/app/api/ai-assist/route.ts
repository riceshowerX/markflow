import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { action, content, selection, context } = await request.json();
    
    if (!content && !selection) {
      return NextResponse.json(
        { error: '请提供内容' },
        { status: 400 }
      );
    }

    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 根据不同操作设置不同的系统提示
    let systemPrompt = '';
    let userPrompt = '';

    switch (action) {
      case 'continue':
        systemPrompt = `你是一个专业的写作助手。请根据用户提供的文档内容，自然地续写后续内容。
要求：
- 保持原文的语气、风格和格式
- 内容要自然流畅，与原文紧密衔接
- 如果原文是技术文档，保持专业性
- 如果原文是创意写作，保持创意性
- 只输出续写的内容，不要输出任何解释或说明`;
        userPrompt = `请续写以下内容：\n\n${content}`;
        break;

      case 'polish':
        systemPrompt = `你是一个专业的文字编辑。请帮助用户润色选中的文本，使其更加通顺、专业、有表现力。
要求：
- 保持原文的核心意思不变
- 改善语言表达，使其更加流畅
- 修正语法错误和不通顺的表达
- 只输出润色后的内容，不要输出任何解释或说明`;
        userPrompt = `请润色以下文本：\n\n${selection}`;
        break;

      case 'expand':
        systemPrompt = `你是一个专业的内容创作助手。请帮助用户扩展选中的文本，添加更多细节和内容。
要求：
- 保持原文的核心意思和风格
- 添加相关的细节、例子或解释
- 使内容更加丰富和完整
- 只输出扩展后的内容，不要输出任何解释或说明`;
        userPrompt = `请扩展以下内容：\n\n${selection}`;
        break;

      case 'summarize':
        systemPrompt = `你是一个专业的文档摘要助手。请帮助用户总结文档的主要内容。
要求：
- 提取核心要点
- 保持简洁明了
- 使用列表形式展示
- 只输出摘要内容`;
        userPrompt = `请总结以下文档的主要内容：\n\n${content}`;
        break;

      case 'translate':
        systemPrompt = `你是一个专业的翻译助手。请将用户选中的文本翻译成目标语言。
目标语言：中文（如果是中文则翻译成英文）
要求：
- 保持原文的意思和语气
- 使用自然流畅的表达
- 只输出翻译结果`;
        userPrompt = `请翻译以下内容：\n\n${selection}`;
        break;

      case 'fix':
        systemPrompt = `你是一个专业的文字校对助手。请帮助用户修正选中文本中的错误。
要求：
- 修正语法错误、拼写错误、标点错误
- 保持原文意思不变
- 只输出修正后的内容`;
        userPrompt = `请修正以下文本中的错误：\n\n${selection}`;
        break;

      case 'outline':
        systemPrompt = `你是一个专业的写作规划助手。请根据用户提供的主题或内容，生成一个详细的写作大纲。
要求：
- 结构清晰，层次分明
- 每个要点简洁明确
- 适合作为写作参考
- 只输出大纲内容`;
        userPrompt = `请为以下主题生成写作大纲：\n\n${content}`;
        break;

      case 'title':
        systemPrompt = `你是一个专业的标题创作助手。请根据文档内容，生成几个合适的标题建议。
要求：
- 标题要吸引人且准确概括内容
- 提供3-5个不同风格的标题选项
- 每个标题一行
- 只输出标题，不要编号`;
        userPrompt = `请为以下内容生成标题建议：\n\n${content}`;
        break;

      case 'explain':
        systemPrompt = `你是一个专业的技术讲解助手。请用简单易懂的语言解释选中的内容。
要求：
- 使用通俗易懂的语言
- 必要时举例说明
- 只输出解释内容`;
        userPrompt = `请解释以下内容：\n\n${selection}`;
        break;

      case 'rewrite':
        systemPrompt = `你是一个专业的写作助手。请帮助用户改写选中的文本，使其表达方式不同但意思相同。
要求：
- 完全重写，使用不同的表达方式
- 保持原文核心意思不变
- 可以调整句子结构
- 只输出改写后的内容`;
        userPrompt = `请改写以下内容：\n\n${selection}`;
        break;

      default:
        systemPrompt = `你是一个专业的写作助手。请根据用户的请求提供帮助。`;
        userPrompt = content || selection || '';
    }

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt },
    ];

    // 使用流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = client.stream(messages, {
            temperature: 0.7,
            model: 'doubao-seed-1-6-flash-250615', // 使用快速模型
          });

          for await (const chunk of llmStream) {
            if (chunk.content) {
              const text = chunk.content.toString();
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'AI 服务暂时不可用' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'AI 服务暂时不可用，请稍后重试' },
      { status: 500 }
    );
  }
}
