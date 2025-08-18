import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Upload, FileText, Send } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { sites, disciplines, User } from "@/lib/mockData";
import { useCreateInitiative } from "@/hooks/useInitiatives";

interface InitiativeFormProps {
  user: User;
}
const formSchema = z.object({
  title: z.string().min(1, "Initiative title is required").min(10, "Title must be at least 10 characters"),
  initiatorName: z.string().min(1, "Initiator name is required"),
  site: z.string().min(1, "Site selection is required"),
  discipline: z.string().min(1, "Discipline selection is required"),
  
  date: z.date({
    required_error: "Date is required",
  }),
  description: z.string().min(1, "Description is required").min(50, "Description must be at least 50 characters"),
  baselineData: z.string().min(1, "Baseline data is required"),
  targetOutcome: z.string().min(1, "Target outcome is required"),
  targetValue: z.number().min(0, "Target value must be positive"),
  isBudgeted: z.boolean(),
  expectedValue: z.number().min(0, "Expected value must be positive"),
  confidenceLevel: z.number().min(1).max(100),
  assumption1: z.string().min(1, "First assumption is required"),
  assumption2: z.string().min(1, "Second assumption is required"),
  assumption3: z.string().min(1, "Third assumption is required"),
  estimatedCapex: z.number().min(0, "CAPEX must be positive")
});

type FormData = z.infer<typeof formSchema>;

export default function InitiativeForm({ user }: InitiativeFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  // Check if user has permission to create initiatives
  if (user.role !== "STLD") {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
            <p className="text-muted-foreground">
              Only users with SITE TSD LEAD role can create new initiatives.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your current role: {user.role}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const createInitiativeMutation = useCreateInitiative();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      initiatorName: user.fullName || "",
      site: user.site || "",
      discipline: "",
      date: new Date(),
      baselineData: "",
      targetOutcome: "",
      isBudgeted: false,
      confidenceLevel: 80,
      targetValue: 0,
      expectedValue: 0,
      estimatedCapex: 0,
      assumption1: "",
      assumption2: "",
      assumption3: "",
    },
  });

  const onSubmit = (data: FormData) => {
    const initiativeData = {
      title: data.title,
      description: data.description,
      priority: "Medium", // Default priority
      expectedSavings: data.expectedValue,
      site: data.site,
      discipline: data.discipline,
      startDate: data.date.toISOString().split('T')[0],
      endDate: new Date(data.date.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from start
      requiresMoc: data.estimatedCapex > 10, // MOC required if CAPEX > 10 lakhs
      requiresCapex: data.estimatedCapex > 0
    };

    createInitiativeMutation.mutate(initiativeData, {
      onSuccess: (data) => {
        toast({
          title: "Initiative Submitted Successfully!",
          description: `Initiative has been created and sent for approval.`,
        });
        form.reset();
        setFiles([]);
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to create initiative",
          variant: "destructive"
        });
      }
    });
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">New Initiative</h1>
          <p className="text-muted-foreground">Submit a new operational excellence initiative</p>
        </div>
        <Badge variant="outline" className="text-sm">
          Stage 1: Register Initiative
        </Badge>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the fundamental details of your initiative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Initiative Title *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a descriptive title for your initiative" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initiatorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initiator Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initiative Date *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="site"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select site" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map((site) => (
                            <SelectItem key={site.code} value={site.code}>
                              {site.code} - {site.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discipline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discipline *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select discipline" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {disciplines.map((discipline) => (
                            <SelectItem key={discipline.code} value={discipline.code}>
                              <div className="flex flex-col">
                                <span>{discipline.name} ({discipline.code})</span>
                                <span className="text-xs text-muted-foreground">{discipline.details}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>


              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of the initiative including current challenges, proposed solution, and expected impact..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Target & Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Target & Financial Information</CardTitle>
              <CardDescription>
                Define measurable outcomes and financial expectations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="baselineData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Baseline Data (12-month historical) *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide 12-month historical data that establishes the current baseline performance..."
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetOutcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Outcome *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Reduce energy consumption by 15%" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="targetValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Value (Numeric) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="15"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expectedValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Value (₹ Lakhs) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="12.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confidenceLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confidence Level (%) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="100" 
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 80)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedCapex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated CAPEX (₹ Lakhs) *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="5.2"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isBudgeted"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        This initiative is budgeted
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Check if funds have been allocated in the current budget
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Key Assumptions */}
          <Card>
            <CardHeader>
              <CardTitle>Key Assumptions</CardTitle>
              <CardDescription>
                List the three most critical assumptions for this initiative
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="assumption1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assumption 1 *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Current production volume remains stable" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assumption2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assumption 2 *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Energy prices increase by 10% annually" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assumption3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assumption 3 *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Technology implementation completed within 6 months" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* File Attachments */}
          <Card>
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
              <CardDescription>
                Upload relevant documents, studies, or supporting materials
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-4">
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary hover:text-primary-hover">Click to upload</span>
                    <span className="text-muted-foreground"> or drag and drop</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  PDF, DOC, XLS, PPT, or image files up to 10MB each
                </p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files:</Label>
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end">
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Submit for Approval
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}