"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Target, 
  Plus, 
  Home, 
  GraduationCap, 
  Plane, 
  Shield, 
  TrendingUp,
  Calendar,
  DollarSign,
  CheckCircle2,
  Edit,
  Trash2
} from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

const goalCategories = [
  { id: 'retirement', name: 'Retirement', icon: TrendingUp, color: 'text-purple-600' },
  { id: 'house', name: 'House/Property', icon: Home, color: 'text-blue-600' },
  { id: 'education', name: 'Education', icon: GraduationCap, color: 'text-green-600' },
  { id: 'vacation', name: 'Vacation', icon: Plane, color: 'text-orange-600' },
  { id: 'emergency', name: 'Emergency Fund', icon: Shield, color: 'text-red-600' },
  { id: 'other', name: 'Other', icon: Target, color: 'text-gray-600' },
]

export function InvestmentGoals({ goals: initialGoals }) {
  const router = useRouter()
  const [goals, setGoals] = useState(initialGoals || [])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState(null)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_amount: '',
    target_date: '',
    category: 'other'
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const openCreateDialog = () => {
    setEditingGoal(null)
    setFormData({
      title: '',
      description: '',
      target_amount: '',
      target_date: '',
      category: 'other'
    })
    setDialogOpen(true)
  }

  const openEditDialog = (goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_amount: goal.target_amount,
      target_date: goal.target_date ? new Date(goal.target_date).toISOString().split('T')[0] : '',
      category: goal.category
    })
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.target_amount) {
      toast.error("Please fill in required fields")
      return
    }

    setLoading(true)
    try {
      const url = editingGoal 
        ? `/api/investment-goals/update`
        : `/api/investment-goals/create`
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(editingGoal && { id: editingGoal.id }),
          ...formData
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success(editingGoal ? "Goal updated!" : "Goal created!")
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to save goal")
      }
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!goalToDelete) return

    setLoading(true)
    try {
      const response = await fetch('/api/investment-goals/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: goalToDelete.id })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("Goal deleted")
        setDeleteDialogOpen(false)
        setGoalToDelete(null)
        router.refresh()
      } else {
        toast.error(data.error || "Failed to delete goal")
      }
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const confirmDelete = (goal) => {
    setGoalToDelete(goal)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      <Card className="shadow-lg shadow-black/10">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Investment Goals
              </CardTitle>
              <CardDescription>Track your financial targets and progress</CardDescription>
            </div>
            <Button onClick={openCreateDialog} size="sm" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!goals || goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50 text-muted-foreground" />
              <p className="text-lg font-medium mb-1">No goals yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Set your first financial goal to start tracking progress
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const categoryInfo = goalCategories.find(c => c.id === goal.category) || goalCategories[5]
                const Icon = categoryInfo.icon
                const progress = goal.target_amount > 0 
                  ? (parseFloat(goal.current_amount || 0) / parseFloat(goal.target_amount)) * 100 
                  : 0
                const isCompleted = progress >= 100
                const daysRemaining = goal.target_date 
                  ? Math.ceil((new Date(goal.target_date) - new Date()) / (1000 * 60 * 60 * 24))
                  : null

                return (
                  <Card key={goal.id} className={`${isCompleted ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : ''}`}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 dark:bg-green-900/30' : 'bg-muted'}`}>
                              <Icon className={`h-5 w-5 ${isCompleted ? 'text-green-600' : categoryInfo.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="font-semibold truncate">{goal.title}</h4>
                                {isCompleted && (
                                  <Badge className="bg-green-600 text-white">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              {goal.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                  {goal.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 flex-shrink-0 ml-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditDialog(goal)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => confirmDelete(goal)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{progress.toFixed(1)}%</span>
                          </div>
                          <Progress value={Math.min(progress, 100)} className="h-2" />
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{formatCurrency(goal.current_amount || 0)}</span>
                            <span className="text-muted-foreground">of {formatCurrency(goal.target_amount)}</span>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-2 border-t">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatCurrency(parseFloat(goal.target_amount) - parseFloat(goal.current_amount || 0))} remaining</span>
                          </div>
                          {goal.target_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {daysRemaining > 0 
                                  ? `${daysRemaining} days left`
                                  : daysRemaining === 0
                                  ? 'Due today'
                                  : `${Math.abs(daysRemaining)} days overdue`
                                }
                              </span>
                            </div>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {categoryInfo.name}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Goal' : 'Create New Goal'}</DialogTitle>
            <DialogDescription>
              Set a financial target and track your progress toward achieving it
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Goal Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Buy a House"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add details about your goal..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="target_amount">Target Amount *</Label>
                <Input
                  id="target_amount"
                  name="target_amount"
                  type="number"
                  value={formData.target_amount}
                  onChange={handleInputChange}
                  placeholder="50000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="target_date">Target Date</Label>
                <Input
                  id="target_date"
                  name="target_date"
                  type="date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`h-4 w-4 ${cat.color}`} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editingGoal ? 'Update Goal' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Goal"
        description={`Are you sure you want to delete "${goalToDelete?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        loading={loading}
        onConfirm={handleDelete}
        onCancel={() => {
          setDeleteDialogOpen(false)
          setGoalToDelete(null)
        }}
      />
    </>
  )
}

