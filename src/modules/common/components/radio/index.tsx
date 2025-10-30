const Radio = ({ checked, 'data-testid': dataTestId }: { checked: boolean, 'data-testid'?: string }) => {
  return (
    <>
      <button
        type="button"
        role="radio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className="group relative flex h-5 w-5 items-center justify-center outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        data-testid={dataTestId || 'radio-button'}
      >
        {/* Outer circle border */}
        <div className="h-5 w-5 border-2 border-black bg-white rounded-full flex items-center justify-center">
          {/* Inner circle when checked */}
          {checked && (
            <div className="h-2.5 w-2.5 bg-black rounded-full" />
          )}
        </div>
      </button>
    </>
  )
}

export default Radio
