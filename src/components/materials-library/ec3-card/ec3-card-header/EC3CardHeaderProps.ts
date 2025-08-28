export interface EC3CardHeaderProps {
  searchTerm: string
  isSearching: boolean
  isAutoScrollEnabled: boolean
  onSearchTermChange: (value: string) => void
  onSearch: () => void
  onIsAutoScrollEnabledChange: (isAutoScrollEnabled: boolean) => void
}
