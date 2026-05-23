export default function DeleteModal({ task, onConfirm, onCancel }) {
  return (
    // Clicking the overlay (outside the modal) cancels
    <div className="modal-overlay" onClick={onCancel}>

      {/* stopPropagation prevents overlay click from firing when clicking inside */}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>Delete Task</h3>
        <p>
          Are you sure you want to delete{' '}
          <strong>&ldquo;{task.title}&rdquo;</strong>? This action cannot be undone.
        </p>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>

    </div>
  )
}