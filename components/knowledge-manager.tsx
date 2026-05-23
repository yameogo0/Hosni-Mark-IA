'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2, Save, BookOpen } from 'lucide-react'

interface KnowledgeItem {
  id: string
  title: string
  content: string
  category: string
}

export function KnowledgeManager() {
  const [items, setItems] = useState<KnowledgeItem[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [category, setCategory] = useState('marketing')

  const addItem = () => {
    if (!newTitle || !newContent) return
    
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      title: newTitle,
      content: newContent,
      category
    }
    
    setItems([...items, newItem])
    setNewTitle('')
    setNewContent('')
  }

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Base de connaissances
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Titre"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            placeholder="Contenu..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={3}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="marketing">Marketing</option>
            <option value="sales">Vente</option>
            <option value="strategy">Stratégie</option>
            <option value="crm">CRM</option>
          </select>
          <Button onClick={addItem} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
              <p className="text-sm mt-2">{item.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}