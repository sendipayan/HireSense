"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export interface SearchableSelectProps {
    options: { label: string; value: string }[]
    value?: string
    onSelect: (value: string) => void
    onSearch: (value: string) => void
    placeholder?: string
    searchPlaceholder?: string
    className?: string
    loading?: boolean
    emptyMessage?: string
    debounceTime?: number
}

export function SearchableSelect({
    options,
    value,
    onSelect,
    onSearch,
    placeholder = "Select...",
    searchPlaceholder = "Search...",
    className,
    loading = false,
    emptyMessage = "No results found.",
    debounceTime = 500,
}: SearchableSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")

    React.useEffect(() => {
        const handler = setTimeout(() => {
            onSearch(searchQuery)
        }, debounceTime)

        return () => {
            clearTimeout(handler)
        }
    }, [searchQuery, debounceTime])

    const selectedLabel = React.useMemo(() => {
        return options.find((item) => item.value === value)?.label || value
    }, [options, value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full justify-between items-center px-3 py-2 text-sm shadow-xs border-input font-normal hover:bg-transparent hover:text-foreground",
                        !value && "text-muted-foreground",
                        className
                    )}
                >
                    {value ? selectedLabel : placeholder}
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder={searchPlaceholder}
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                    />
                    <CommandList>
                        {loading ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                Loading...
                            </div>
                        ) : (
                            <>
                                {options.length === 0 && (
                                    <CommandEmpty>{emptyMessage}</CommandEmpty>
                                )}
                                <CommandGroup>
                                    {options.map((option) => (
                                        <CommandItem
                                            key={option.value}
                                            value={option.value}
                                            onSelect={() => {
                                                onSelect(option.value)
                                                setOpen(false)
                                                setSearchQuery("")
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    value === option.value ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {option.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
