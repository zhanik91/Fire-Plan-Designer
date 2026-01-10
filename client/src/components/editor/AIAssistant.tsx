import React, { useState } from 'react';
import { usePlanStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Bot, Send, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { ELEMENT_LABELS } from '@/lib/types';

interface Message {
  role: 'assistant' | 'user';
  content: React.ReactNode;
}

export function AIAssistant() {
  const store = usePlanStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я ваш ИИ-помощник по пожарной безопасности. Я могу проанализировать ваш план или ответить на вопросы по стандартам (ГОСТ/ISO).' }
  ]);
  const [input, setInput] = useState('');

  const calculateStats = () => {
    const exits = store.elements.filter(e => e.type === 'exit').length;
    const extinguishers = store.elements.filter(e => e.type === 'extinguisher').length;
    const routes = store.routes.length;

    // Rough area approximation (bounding box)
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    store.walls.forEach(w => {
      w.points.forEach(p => {
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.y > maxY) maxY = p.y;
      });
    });

    const hasWalls = store.walls.length > 0;
    const width = hasWalls ? (maxX - minX) : 0;
    const height = hasWalls ? (maxY - minY) : 0;

    // Convert to meters if scale exists (default 50px = 1m approx if not calibrated)
    const ppm = store.metadata.pixelsPerMeter || 50;
    const areaM2 = hasWalls ? ((width / ppm) * (height / ppm)).toFixed(1) : 0;

    return { exits, extinguishers, routes, areaM2, hasWalls };
  };

  const handleAnalyze = () => {
    const stats = calculateStats();
    const suggestions = [];

    if (!stats.hasWalls) {
      suggestions.push('• Начните с рисования стен вашего помещения.');
    } else {
      suggestions.push(`• Примерная площадь помещения: ${stats.areaM2} м².`);
    }

    if (stats.exits === 0) {
      suggestions.push('• ВНИМАНИЕ: На плане отсутствуют эвакуационные выходы!');
    } else {
      suggestions.push(`• Найдено выходов: ${stats.exits}.`);
    }

    if (stats.extinguishers === 0) {
        suggestions.push('• Рекомендация: Добавьте огнетушители (обычно 1 на 50-100 м²).');
    }

    if (stats.routes === 0 && stats.hasWalls) {
      suggestions.push('• Не забудьте нарисовать пути эвакуации (сплошная линия - основной, пунктир - запасной).');
    }

    const response = (
      <div className="space-y-2">
        <p className="font-semibold">Анализ текущего плана:</p>
        <ul className="text-sm space-y-1">
          {suggestions.map((s, i) => (
            <li key={i} className={s.includes('ВНИМАНИЕ') ? 'text-red-500 font-bold' : ''}>{s}</li>
          ))}
        </ul>
      </div>
    );

    setMessages(prev => [...prev, { role: 'user', content: 'Проанализируй план' }, { role: 'assistant', content: response }]);
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = input.trim().toLowerCase();
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');

    // Simple keyword matching for "AI" behavior
    setTimeout(() => {
      let response: React.ReactNode = 'Извините, я пока учусь. Попробуйте спросить про "нормы", "знаки" или нажмите кнопку "Анализ".';

      if (userMsg.includes('норм') || userMsg.includes('гост') || userMsg.includes('правила')) {
        response = 'Согласно ППБ и ГОСТ, планы эвакуации должны быть размещены на видных местах. Пути эвакуации должны быть свободны. Знаки должны быть фотолюминесцентными (светящимися).';
      } else if (userMsg.includes('высота') || userMsg.includes('размер')) {
        response = 'Обычно планы эвакуации делают в формате А3 (400х300мм) для локальных планов и А2 (600х400мм) для этажных. Знаки безопасности должны быть не менее 50мм высотой.';
      } else if (userMsg.includes('цвет') || userMsg.includes('красн') || userMsg.includes('зелен')) {
        response = 'Зеленый цвет обозначает безопасность (выходы, аптечки). Красный - пожарную технику (огнетушители, краны).';
      } else if (userMsg.includes('анализ')) {
        handleAnalyze();
        return;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200 w-80 shadow-xl">
      <div className="p-4 border-b bg-slate-50 flex items-center gap-2">
        <Bot className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-slate-800">Smart Assistant</h3>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-slate-50 space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          onClick={handleAnalyze}
        >
          <AlertTriangle className="h-4 w-4" />
          Проверить ошибки плана
        </Button>

        <div className="flex gap-2">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Спросите о нормах..."
            className="text-sm"
          />
          <Button size="icon" onClick={handleSend} disabled={!input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
