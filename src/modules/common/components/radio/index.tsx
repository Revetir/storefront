const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-4 w-4 items-center justify-center outline-none"
        data-testid={dataTestId || 'radio-button'}
      >
        {/* Outer circle border */}
        <div className="h-4 w-4 border-2 border-black bg-white rounded-full flex items-center justify-center">
          {/* Inner circle when checked */}
          {checked && (
            <div className="h-2 w-2 bg-black rounded-full" />
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
